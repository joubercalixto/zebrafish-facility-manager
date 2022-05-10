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
import {StockFilter} from './stock-filter';
import {StockMiniDto} from '../common/Stock/stockMiniDto';
import {Brackets, SelectQueryBuilder} from 'typeorm';
import {StockReportDTO} from './dto/stock-report.dto';
import moment from 'moment';
import {AutoCompleteOptions} from '../helpers/autoCompleteOptions';

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

  // ========================= Searches =======================
  async findByName(name: string): Promise<Stock> {
    return await this.repo.findOne({
      where: {name}, relations: [
        'transgenes', 'mutations']
    });
  }

  async findByNumber(num: number): Promise<Stock[]> {
    return await this.repo.find({where: {number: num}});
  }

  async getById(id: number): Promise<Stock> {
    return this.mustExist(id);
  }

  async getFullById(id: number): Promise<Stock> {
    const stock: Stock = await this.repo.findOne(id, {
      relations: [
        'transgenes', 'mutations', 'swimmers', 'swimmers.tank',
        'matStock', 'matStock.mutations', 'matStock.transgenes',
        'patStock', 'patStock.mutations', 'patStock.transgenes',
        'piUser', 'researcherUser',
      ]
    });
    if (stock) {
      await this.computeAncillaryFields(stock);
    }
    return stock;
  }

  async getMediumById(id: number): Promise<Stock> {
    return await this.repo.findOne(id, {
      relations: [
        'transgenes', 'mutations',
        'matStock',
        'patStock',
        'piUser',
        'researcherUser'
      ]
    });
  }

  async getStockWithGenetics(id: number): Promise<Stock> {
    return await this.repo.findOne(id, {
      relations: [
        'transgenes', 'mutations',
      ]
    });
  }

  // ========================= helper =======================
  extendComment(s1: string | null, s2: string): string {
    if (s1) {
      s1.concat('; ', s2);
    } else {
      return s2;
    }
  }

  // ========================= Validation =======================
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
    // and NOT through full-fledged parental stocks.  So get rid of matStock
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
      candidate.subNumber = await this.getNextSubStockNumber(candidate.number);
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
        candidate.number = await this.getNextStockNumber();
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
        const ms: Stock = await this.getStockWithGenetics(candidate.matIdInternal);
        candidate.transgenes = ms.transgenes;
        candidate.mutations = ms.mutations;
      }
      if (candidate.patIdInternal) {
        const ps: Stock = await this.getStockWithGenetics(candidate.patIdInternal);
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
    const kids: Stock[] = await this.getOffspring(stock.id);
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
    let candidate = await this.getFullById(dto.id);

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
    const stock: Stock = await this.getFullById(stockId);
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

  // Find a set of stocks which match the filter criteria.
  // I know that the server should be agnostic to what a particular function
  // is used for on the client side, but this filtered list is used in the
  // stock selector. Sue me.
  // The complexity comes from the fact that the filter can be on objects associated
  // with the stock (like it's transgenes) and not simply on the stock itself.
  async findFiltered(filter: StockFilter): Promise<StockMiniDto[]> {
    // console.log('Filter: ' + JSON.stringify(filter, null, 2));

    // For this query we only look at a few fields
    let q: SelectQueryBuilder<Stock> = this.repo.createQueryBuilder('stock')
        .leftJoin('stock.researcherUser', 'ru')
        .select('stock.id, stock.name, stock.description, stock.comment, stock.fertilizationDate')
        .addSelect('ru.name', 'researcher')
        .groupBy('stock.id');

    // We have to join a bunch of relationships based on what we are filtering for.
    // So, for example, if the filter does not include mutations, we do not need to join that table.
    if (filter.mutationId || filter.mutation) {
      q = q.leftJoin('stock.mutations', 'mutation');
    }
    if (filter.transgeneId || filter.transgene) {
      q = q.leftJoin('stock.transgenes', 'transgene');
    }
    if (filter.liveStocksOnly || filter.tankName) {
      q = q.leftJoin('stock.swimmers', 'swimmers');
    }
    if (filter.tankName) {
      q = q.leftJoin('swimmers.tank', 'tank')
    }

    q = this.buildWhereConditions(q, filter);

    const stocks: any[] = await q
        .limit(100)
        .getRawMany();

    // Please look the other way now for a minute
    const stockMinis: StockMiniDto[] = [];
    for (const s of stocks) {
      const stockWithGenetics: Stock = await this.getStockWithGenetics(s.id);
      stockMinis.push({
        id: s.id,
        name: s.name,
        description: s.description,
        researcher: s.researcher,
        comment: (s.comment) ? s.comment.substr(0, 45) : '',
        fertilizationDate: s.fertilizationDate,
        alleleSummary: stockWithGenetics.alleleSummary,
      });
    }
    return stockMinis;
  }


  // Find a set of stocks which match the filter criteria, for use in the "Tank Walker"
  // I know that the server should be agnostic to what a particular function
  // is used for on the client side, but this filtered list is used in the
  // Tank Walker. Sue me.
  async getStocksForTankWalk(filter: StockFilter): Promise<any[]> {
    // We are only interested in stocks that are in tanks.
    filter.liveStocksOnly = true;

    // For this query we only look at a few fields
    // Sort the result in tank order to facilitate someone being able to walk
    // around the facility on the trail of a particular set of stocks.
    let q: SelectQueryBuilder<Stock> = this.repo.createQueryBuilder('stock')
        .select('stock.id as stockId, stock.name as stockName, ' +
            'tank.id as tankId, tank.name as tankName, swimmers.num, swimmers.comment')
        .orderBy('tank.id')
        .addOrderBy('stock.id')
        .groupBy('stock.id');

    // we always join stocks to their swimmers and swimmers to their tanks because
    // the tank walker only makes sense for stocks that are in tanks.
    q = q.leftJoin('stock.swimmers', 'swimmers')
        .leftJoin('swimmers.tank', 'tank')

    // join mutation or transgenes of relationships based if filtering on those
    if (filter.mutationId || filter.mutation) {
      q = q.leftJoin('stock.mutations', 'mutation');
    }
    if (filter.transgeneId || filter.transgene) {
      q = q.leftJoin('stock.transgenes', 'transgene');
    }

    // building the where conditions for the filter is exactly the same as elsewhere
    q = this.buildWhereConditions(q, filter);

    return await q.getRawMany();
  }

  // Get information about stocks so that the client can build
  // a comprehensive spreadsheet of the stocks that meet the filter criteria.
  async getStocksForReport(filter: StockFilter): Promise<StockReportDTO[]> {
    if (!filter) {
      filter = {};
    }

    // regardless of the filter criteria, we need to join all related objects to
    // every stock in order to get all the information required for the report.
    let q: SelectQueryBuilder<Stock> = this.repo.createQueryBuilder('stock')
        .leftJoin('stock.matStock', 'mom')
        .leftJoin('stock.patStock', 'dad')
        .leftJoin('stock.mutations', 'mutation')
        .leftJoin('stock.transgenes', 'transgene')
        .leftJoin('stock.swimmers', 'swimmers')
        .leftJoin('swimmers.tank', 'tank')
        .leftJoin('stock.researcherUser', 'researcher')
        .leftJoin('stock.piUser', 'pi')
        .select('stock.name', 'Stock')
        .addSelect('stock.description', 'Description')
        .addSelect('researcher.name', 'Researcher')
        .addSelect('pi.name', 'PI')
        .addSelect('DATE_FORMAT(stock.fertilizationDate, "%Y-%m-%d")', 'DOB')
        .addSelect('mom.name', 'Mother')
        .addSelect('dad.name', 'Father')
        .addSelect('GROUP_CONCAT(DISTINCT mutation.name SEPARATOR "; ") Mutations')
        .addSelect('GROUP_CONCAT(DISTINCT transgene.descriptor SEPARATOR "; ") Transgenes')
        .addSelect('GROUP_CONCAT(DISTINCT tank.name SEPARATOR "; ") Tanks')
        .where('1')
        .groupBy('stock.id');

    // building the where conditions for the filter is exactly the same as elsewhere
    q = this.buildWhereConditions(q, filter);
    const items = await q
        .getRawMany();

    return items.map(item => {
      return new StockReportDTO(item);
    });
  }

  // Build "where" conditions of a query based on the data in a stock filter object.
  // BEWARE this function assumes that the stock has been joined to all the necessary
  // relationships to be able to apply where conditions on those relationships.
  // It also assumes no aliasing on the relationships.
  // It really just avoids duplicated code. But the fact that the SelectQueryBuilder talks about
  // object fields inside quotes makes it so that this function and the calling
  // function need to agree on the names of the fields in the quoted strings.
  buildWhereConditions(q: SelectQueryBuilder<any>, filter: StockFilter): SelectQueryBuilder<any> {
    q = q.where('1');

    // filter on a specific researcher
    if (filter.researcherId) {
      q = q.andWhere('stock.researcherId = :id', {id: filter.researcherId});
    }

    // filter on a specific pi
    if (filter.piId) {
      q = q.andWhere('stock.piId = :id', {id: filter.piId});
    }

    // a filter on the stock number matches the start of the number
    if (filter.number) {
      q = q.andWhere('stock.name LIKE :n', {n: filter.number + '%'});
    }

    // a filter on text looks anywhere in the stocks comment or description only.
    if (filter.text) {
      if (this.configService.allowRegexStockSearch) {
        q = q.andWhere(new Brackets(qb => {
          qb.where('stock.comment REGEXP :t OR stock.description REGEXP :t',
              {t: filter.text});
        }));
      } else {
        q = q.andWhere(new Brackets(qb => {
          qb.where('stock.comment LIKE :t OR stock.description LIKE :t',
              {t: '%' + filter.text + '%'});
        }));
      }
    }

    // a filter on age is a number in days plus an "or older" or "or younger clarification"
    if (filter.age) {
      const dob = moment().subtract(Number(filter.age), 'days');
      if (filter.ageModifier === 'or_older') {
        q = q.andWhere('stock.fertilizationDate <= :d', {d: dob.format('YYYY-MM-DD')});
      } else {
        q = q.andWhere('stock.fertilizationDate >= :d', {d: dob.format('YYYY-MM-DD')});
      }
    }

    // if the filter is for a particular mutationId, you do not need to filter for names.
    // a filter for "mutation" looks in the name and gene and nickname and alternateGeneName fields
    if (filter.mutationId) {
      q = q.andWhere('mutation.id = ' + filter.mutationId);
    } else if (filter.mutation) {
      q = q.andWhere(new Brackets(qb => {
        qb.where('mutation.name LIKE :mt OR mutation.gene LIKE :mt ' +
            'OR mutation.nickname LIKE :mt OR mutation.alternateGeneName LIKE :mt',
            {mt: '%' + filter.mutation + '%'});
      }));
    }

    if (filter.transgeneId) {
      q = q.andWhere('transgene.id = ' + filter.transgeneId);
    } else if (filter.transgene) {
      q = q.andWhere(new Brackets(qb => {
        qb.where('transgene.descriptor LIKE :tg OR transgene.allele LIKE :tg OR transgene.nickname LIKE :tg',
            {tg: '%' + filter.transgene + '%'});
      }));
    }

    // if the filter includes a tank name, we do not need to filter for "liveStocksOnly"
    // because if they are in a tank, they are alive.
    if (filter.tankName) {
      q = q.andWhere('tank.name LIKE :tn', {tn: filter.tankName + '%'});
    } else if (filter.liveStocksOnly) {
      q = q.andWhere('swimmers.tankId IS NOT NULL');
    }
    return q;
  }

  async computeAncillaryFields(stock: Stock) {
    // Set some ancillary computed fields
    // Kludge Alert.  Clearly this should be done in the Stock Class but that
    // class does not have access to the repository to figure this stuff out.
    // So I do it here.
    stock.offspring = await this.getOffspring(stock.id);
    stock.offspringCount = await this.countOffspring(stock.id);
    stock.nextSubStockNumber = await this.getNextSubStockNumber(stock.number);
    stock.isDeletable = this.isDeletable(stock);
    stock.parentsEditable = this.parentsEditable(stock);
    return;
  }

  // You cannot delete a stock if
  // - it is alive in a tank
  // - it has descendants
  // - it is a base stock and it has subStocks
  // Belt and suspenders.  We use this function to
  // a) send a deletable flag to the GUI so it can disable deletes appropriately
  // b) check before performing a delete request
  // Icky - it assumes two other ancillary fields have been computed.
  isDeletable(stock: Stock): boolean {
    if (stock.offspringCount > 0) {
      return false;
    }
    if (stock.swimmers.length > 0) {
      return false;
    }
    return !(stock.subNumber === 0 && stock.nextSubStockNumber > 1);
  }

  // You cannot edit the parents of a stock if it would lead to inconsistencies
  // in the data.  Specifically
  // - a stock with subStocks: can't change the parent of the stock or any of the
  //   subStocks because they must all have the same parents.
  // - a stock with offspring: because the offspring's mutations and transgenes came
  //   from parent in the first place, so if you change the parent's parent, the
  //   inheritance becomes wonky.
  parentsEditable(stock: Stock): boolean {
    if (stock.offspringCount > 0) {
      return false;
    }
    return stock.nextSubStockNumber <= 1;
  }

  // What is the next available number for the stock?
  async getNextStockNumber(): Promise<number> {
    const latest = await this.repo.createQueryBuilder('m')
        .select('MAX(m.number)', 'max')
        .getRawOne();
    return Number(latest.max) + 1;
  }

  async getNextStockName(): Promise<any> {
    return {name: String(await this.getNextStockNumber())};
  }

  // What is the next available sub stock number for a given stock number?
  async getNextSubStockNumber(stockNumber): Promise<number> {
    const latest = await this.repo.createQueryBuilder('s')
        .select('MAX(s.subNumber)', 'max')
        .where('s.number = :sn', {sn: stockNumber})
        .getRawOne();
    return Number(latest.max) + 1;
  }

  // values that can be used to auto-complete various fields in the GUI
  async getAutoCompleteOptions(): Promise<AutoCompleteOptions> {
    // once upon a time when stock researchers and PIs were just strings, we
    // used to fetch all the strings for researchers and PI strings
    // that were extant in the database.
    // Nowadays this researchers and pis are references to users.
    return {};
  }

  // We want to get a list of offspring including the mutation and transgene summary,
  // but not all the details of the mutations and transgenes.
  // So we join the mutations and transgenes, build the summary, and then delete the detail.
  async getOffspring(id: number): Promise<Stock[]> {
    if (id === null) return [];
    return await this.repo.find({
          relations: ['transgenes', 'mutations'],
          where: [
            {matIdInternal: id},
            {patIdInternal: id}
          ]
        }
    );
  }

  async countOffspring(id: number): Promise<number> {
    return await this.repo.createQueryBuilder('s')
        .where('s.matIdInternal = :id OR s.patIdInternal = :id', {id})
        .getCount();
  }

}
