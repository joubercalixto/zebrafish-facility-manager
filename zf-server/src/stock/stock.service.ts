import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '../config/config.service';
import {StockRepository} from './stock.repository';
import {GenericService} from '../Generics/generic-service';
import {Stock} from './stock.entity';
import {plainToClassFromExist} from 'class-transformer';
import {Logger} from 'winston';
import {convertEmptyStringToNull} from '../helpers/convertEmptyStringsToNull';
import {UserService} from '../user/user.service';
import {MutationService} from '../mutation/mutation.service';
import {TransgeneService} from '../transgene/transgene.service';
import {Transgene} from '../transgene/transgene.entity';
import {User} from '../user/user.entity';
import {Mutation} from '../mutation/mutation.entity';
import {StockImportDto} from './stock-import-dto';
import {LineageImportDto} from './lineage-import-dto';
import {MarkerImportDto} from './marker-import-dto';

@Injectable()
export class StockService extends GenericService {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    @InjectRepository(StockRepository)
    private readonly repo: StockRepository,
    private readonly userService: UserService,
    private readonly mutationService: MutationService,
    private readonly transgeneService: TransgeneService,
  ) {
    super(logger);
  }

  //========================= Searches =======================
  async findByName(name: string): Promise<Stock> {
    return await this.repo.findOne({
      where: {name: name}, relations: [
        'transgenes', 'mutations']
    });
  }

  async findByNumber(number: number): Promise<Stock[]> {
    return await this.repo.find({where: {number: number}});
  }

  async getById(id: number): Promise<Stock> {
    return this.mustExist(id);
  }

  async getFullById(id: number): Promise<Stock> {
    return this.repo.getStockWithRelations(id);
  }

  async getMediumById(id: number): Promise<Stock> {
    return this.repo.getMediumById(id);
  }

  //========================= helper =======================
  extendComment(s1: string | null, s2: string): string {
    if (s1) {
      s1.concat('; ', s2);
    } else {
      return s2;
    }
  }

  //========================= Validation =======================
  async doesUserExist(username: string): Promise<User> {
    return this.userService.findByUserName(username);
  }

  async doesMutationExist(name: string): Promise<Mutation> {
    return this.mutationService.findByName(name);
  }

  async doesTransgeneExist(allele: string): Promise<Transgene> {
    return this.transgeneService.findByName(allele);
  }

  async doesStockNameExist(name: string): Promise<Stock> {
    return this.findByName(name);
  }

  async mustExist(stockId: number): Promise<Stock> {
    const stock: Stock = await this.repo.findOne(stockId);
    if (stock) {
      return stock;
    } else {
      const message: string = 'Stock does not exist. id: ' + stockId;
      this.logger.error(message,);
      throw new BadRequestException(message);
    }
  }

  // Importing a stock - we only do a few fields plus relationships to pi and researcher
  async import(dto: StockImportDto): Promise<Stock> {
    const problems: string[] = [];
    const candidate = new Stock();
    if (dto.description) candidate.description = dto.description;
    if (dto.comment) candidate.comment = dto.comment;
    if (dto.countEnteringNursery) candidate.countEnteringNursery = dto.countEnteringNursery;
    if (dto.countLeavingNursery) candidate.countLeavingNursery = dto.countLeavingNursery

    // The stock we are importing
    // - must have a name,
    // - the name must be valid,
    // - the stock can not already exist.
    if (!dto.name) {
      this.logAndThrowException(`Cannot import a stock without a name.`);
    } else {
      const stockNum = Stock.convertNameToNumbers(dto.name);
      if (stockNum) {
        candidate.name = dto.name;
        candidate.number = stockNum.stockNumber;
        candidate.subNumber = stockNum.substockNumber;
      } else {
        problems.push(`Cannot import stock named ${dto.name}. Name should be digit*.dd or digit*`);
      }
      const stock: Stock = await this.doesStockNameExist(dto.name);
      if (stock) problems.push(`Cannot import stock ${dto.name}, it already exists.`);
    }

    // The stock we are importing must have a fertilization date
    if (!dto.fertilizationDate) {
      problems.push(`Cannot import a stock without a fertilization date.`);
    }

    // Fertilization Date
    candidate.fertilizationDate = dto.fertilizationDate;

    // For substocks, fertilization date must be the same as the base stock.
    // Note: this logic allows a substock to be imported even if there is no base stock.
    // So, it also allows multiple substocks of a non-existent base stock to have different parentage.
    // Sorry but I'm not going to deal with this - it is bad data.
    if (candidate.subNumber > 0) {
      const baseStock = await this.doesStockNameExist(String(candidate.number));
      if (baseStock) {
        if (candidate.fertilizationDate !== baseStock.fertilizationDate) {
          problems.push(`Substock ${candidate.name} has different fertilization date than its base stock.`);
        }
      }
    }

    if (dto.researcherUsername) {
      const researcher = await this.doesUserExist(dto.researcherUsername);
      if (researcher) {
        candidate.researcherId = researcher.id;
      } else {
        problems.push(`Cannot import stock ${dto.name}, researcher ${dto.researcherUsername} does not exists.`);
      }
    }
    if (dto.piUsername) {
      const pi = await this.doesUserExist(dto.piUsername);
      if (pi) {
        candidate.piId = pi.id;
      } else {
        problems.push(`Cannot import stock ${dto.name}, primary investigator ${dto.piUsername} does not exists.`);
      }
    }

    // if we have encountered problems, time to give up;
    if (problems.length > 0) {
      this.logAndThrowException(problems.join('; '));
    }

    return this.repo.save(candidate);
  }

  // Import the relationship between a stock number and it's parents.
  // All substocks for the stock number are automatically updated too.
  async lineageImport(dto: LineageImportDto): Promise<boolean> {
    const problems: string[] = [];

    if (!dto.stockNumber) {
      problems.push(`Cannot import lineage for a stock without a stock number.`);
    }

    if (isNaN(+dto.stockNumber)) {
      problems.push(`Skipping stock ${dto.stockNumber}, not a valid stock number.`);
    }

    if ((Number(dto.stockNumber) % 1) > 0) {
      problems.push(`Lineage import for substock ${dto.stockNumber} failed. ` +
        `Only import lineage for base stock numbers, substocks will be handled automatically.`);
    }

    // if we have encountered problems, time to give up;
    if (problems.length > 0) {
      this.logAndThrowException(problems.join('; '));
    }

    // Now go get all the stocks that have the given stock number
    // (Thus, one base stock and however many substocks).
    const stocks: Stock[] = await this.findByNumber(Number(dto.stockNumber));

    if (stocks.length === 0) {
      this.logAndThrowException(`No base stock or sub-stocks with number ${dto.stockNumber}`)
    }

    // Do the parents. Data for internal mom or dad takes precedence of data for external mom or dad.
    for (const stock of stocks) {
      // We need to validate that internal parents exist
      if (dto.internalMom) {
        const mom = await this.doesStockNameExist(String(dto.internalMom));
        if (!mom) {
          stock.comment = this.extendComment(stock.comment, `Import Error: Internal mom ${dto.internalMom} does not exist.`);
        } else {
          if (stock.fertilizationDate <= mom.fertilizationDate) {
            stock.comment = this.extendComment(stock.comment, `Import Error: Stock older than its mom: ${mom.name} (${mom.fertilizationDate})`)
          } else {
            stock.matIdInternal = mom.id;
            stock.externalMatDescription = null;
            stock.externalMatId = null;
          }
        }
      } else {
        stock.matIdInternal = null;
        if (dto.externalMomDescription) stock.externalMatDescription = dto.externalMomDescription;
        if (dto.externalMomName) stock.externalMatId = dto.externalMomName;
      }

      if (dto.internalDad) {
        const dad = await this.doesStockNameExist(String(dto.internalDad));
        if (!dad) {
          stock.comment = this.extendComment(stock.comment, `Import Error: Internal dad ${dto.internalDad} does not exist.`);
        } else {
          if (stock.fertilizationDate <= dad.fertilizationDate) {
            stock.comment = this.extendComment(stock.comment, `Import Error: Stock older than its dad: ${dad.name} (${dad.fertilizationDate})`);
          } else {
            stock.patIdInternal = dad.id
            stock.externalPatDescription = null;
            stock.externalPatId = null;
          }
        }
      } else {
        stock.patIdInternal = null;
        if (dto.externalDadDescription) stock.externalPatDescription = dto.externalDadDescription;
        if (dto.externalDadName) stock.externalPatId = dto.externalDadName;
      }
      // if we have encountered problems, time to give up;
      if (problems.length > 0) {
        this.logAndThrowException(problems.join('; '));
      }
      await this.repo.save(stock);
    }
    return true;
  }

  // Import the relationship between a stock and its markers.
  async markerImport(dto: MarkerImportDto): Promise<Stock> {
    const problems: string[] = [];

    // The stock we are importing must have a name
    if (!dto.stockName) {
      this.logAndThrowException(`Cannot import markers for a stock without a name.`);
    }

    // The stock has to exist
    const stock: Stock = await this.doesStockNameExist(dto.stockName);
    if (!stock) {
      this.logAndThrowException(`Cannot import markers for stock ${dto.stockName}, it isn't known in the system.`);
    }

    if (dto.alleles) {
      for (const allele of dto.alleles.split(';')) {
        const mutation = await this.doesMutationExist(allele);
        if (mutation) {
          if (!stock.mutations) stock.mutations = [];
          stock.mutations.push(mutation);
        } else {
          const tg = await this.doesTransgeneExist(allele);
          if (tg) {
            if (!stock.transgenes) stock.transgenes = [];
            stock.transgenes.push(tg);
          } else {
            problems.push(`Cannot import stock ${dto.stockName}, allele ${allele} does not exists.`);
          }
        }
      }
    }

    // if we have encountered problems, time to give up;
    if (problems.length > 0) {
      this.logAndThrowException(problems.join('; '));
    }

    return this.repo.save(stock);
  }

  // For creation, create a fresh stock, merge in the DTO and save.
  async validateAndCreate(dto: any, isSubStock: boolean = false): Promise<Stock> {
    convertEmptyStringToNull(dto);
    // New stocks should not have transgenes, mutations or swimmers,
    // so ignore them if they are present in the incoming dto
    this.ignoreAttribute(dto, 'id');
    this.ignoreAttribute(dto, 'transgenes');
    this.ignoreAttribute(dto, 'mutations');
    this.ignoreAttribute(dto, 'swimmers');

    // Parents are identified via patIdInternal and matIdInternal id references
    // and NOT through full fledged parental stocks.  So get rid of matStock
    // and patStock objects if they arrived in the dto.
    this.ignoreAttribute(dto, 'patStock');
    this.ignoreAttribute(dto, 'matStock');

    let candidate: Stock = new Stock();
    candidate = plainToClassFromExist(candidate, dto);

    // If creating a sub-stock, the subStock number is the next available
    // subStock for the given stock number.
    if (isSubStock) {
      const baseStock: Stock = await this.repo.findOne({number: candidate.number, subNumber: 0},
        {relations: ['mutations', 'transgenes']});
      if (!baseStock) {
        this.logAndThrowException(`Trying to create subStock, but stock ${candidate.number} does not exist.`);
      }
      candidate.subNumber = await this.repo.getNextSubStockNumber(candidate.number);
      // For sub-stock creation, take all the transgenes and mutations from the original stock
      candidate.mutations = baseStock.mutations;
      candidate.transgenes = baseStock.transgenes;
    } else {
      // Creating a new stock
      // When a new system is allowing users to edit the stock name - stocks only, not substocks
      if (this.configService.allowStockNumberOverride) {
        // accept digits only
        if (candidate.name !== candidate.name.replace(/\D/, '')) {
          const msg = 'Stock name must contain only digits and cannot be a substock';
          this.logAndThrowException(msg);
        } else {
          candidate.number = Number(candidate.name);
          candidate.subNumber = 0;
        }
      } else {
        candidate.number = await this.repo.getNextStockNumber();
        candidate.subNumber = 0;
      }
    }
    candidate.setName();

    await this.setParents(candidate);
    // For stock creation (i.e. not substock) we should inherit
    // all transgenes and mutations from the parents. Avoid duplicates.
    if (!isSubStock) {
      candidate.mutations = [];
      candidate.transgenes = [];
      if (candidate.matIdInternal) {
        const ms: Stock = await this.repo.getStockWithGenetics(candidate.matIdInternal);
        candidate.transgenes = ms.transgenes;
        candidate.mutations = ms.mutations;
      }
      if (candidate.patIdInternal) {
        const ps: Stock = await this.repo.getStockWithGenetics(candidate.patIdInternal);
        for (const mut of ps.mutations) {
          if (candidate.mutations.filter(m => mut.id === m.id).length === 0) {
            candidate.mutations.push(mut);
          }
        }
        for (const tg of ps.transgenes) {
          if (candidate.transgenes.filter(t => tg.id === t.id).length === 0) {
            candidate.transgenes.push(tg);
          }
        }
      }
    }

    await this.validateAges(candidate);
    // If creating a stock, the stock number is sequential and the sub-stock is 0.
    return await this.repo.save(candidate);
  }

  async setParents(stock: Stock) {
    delete stock.matStock;
    delete stock.patStock;
    if (stock.matIdInternal) {
      stock.matStock = await this.mustExist(stock.matIdInternal);
      stock.externalMatId = null;
      stock.externalMatDescription = null;
    }
    if (stock.patIdInternal) {
      stock.patStock = await this.mustExist(stock.patIdInternal);
      stock.externalPatId = null;
      stock.externalPatDescription = null;
    }
  }

  async validateAges(stock: Stock) {
    if (stock.matStock) {
      this.validateFertilizationDates(stock, stock.matStock);
    }
    if (stock.patIdInternal) {
      this.validateFertilizationDates(stock, stock.patStock);
    }
    const kids: Stock[] = await this.repo.getOffspring(stock.id);
    for (const kid of kids) {
      this.validateFertilizationDates(kid, stock);
    }
  }

  validateFertilizationDates(child: Stock, parent: Stock) {
    if (child.fertilizationDate &&
      parent.fertilizationDate &&
      child.fertilizationDate <= parent.fertilizationDate) {
      this.logAndThrowException('Child stock (' + child.name + ') older than ' +
        'parent stock (' + parent.name + ').');
    }
  }

  // For update, lookup the stock, merge in the DTO and save.
  // Note: we do not update Swimmers with this method, so if swimmers come in the
  // DTO, remove them. FWIW relationships to Transgenes and Mutations and parents
  // *are* updated.
  // TODO dont let the parents change if they should not - i.e. for substocks
  async validateAndUpdate(dto: any): Promise<any> {
    convertEmptyStringToNull(dto);
    // the client is not permitted to change the stock name, number or subNumber
    // so if a client sends any of those, just ignore them.
    this.ignoreAttribute(dto, 'name');
    this.ignoreAttribute(dto, 'number');
    this.ignoreAttribute(dto, 'subNumber');
    this.mustHaveAttribute(dto, 'id');
    let candidate = await this.repo.getStockWithRelations(dto.id);

    if (!candidate) {
      this.logAndThrowException(`Stock does not exist. Id: ${dto.id}`)
    }

    candidate = plainToClassFromExist(candidate, dto);

    await this.setParents(candidate);
    await this.validateAges(candidate);

    delete candidate.swimmers;
    return await this.repo.save(candidate);
  }

  // For deletion, check that the stock exists, and that deletion is sensible.
  async validateAndRemove(stockId: any): Promise<any> {
    const stock: Stock = await this.repo.getStockWithRelations(stockId);
    if (!stock.isDeletable) {
      this.logAndThrowException('Attempt to delete stock that either has descendants, or is alive in ' +
        'some tank or has subStocks.');
    }
    return await this.repo.remove(stock);
  }

  async getStocksForExport(): Promise<any[]> {
    return await this.repo.createQueryBuilder('s')
      .select([
        's.id', 's.name', 's.description', 's.fertilizationDate', 's.comment',
        's.countEnteringNursery', 's.countLeavingNursery',
        'm.id', 'm.name', 'm.gene', 'm.gene', 'm.nickname',
        't.id', 't.allele', 't.descriptor', 't.nickname',
        'mom.name', 'dad.name',
        'researcher.username', 'pi.username',
        'swimmers.tankId', 'swimmers.number', 'swimmers.comment',
        'tank.name'
      ])
      .leftJoin('s.matStock', 'mom')
      .leftJoin('s.patStock', 'dad')
      .leftJoin('s.mutations', 'm')
      .leftJoin('s.transgenes', 't')
      .leftJoin('s.swimmers', 'swimmers')
      .leftJoin('swimmers.tank', 'tank')
      .leftJoin('s.researcherUser', 'researcher')
      .leftJoin('s.piUser', 'pi')
      .getMany();
  }
}
