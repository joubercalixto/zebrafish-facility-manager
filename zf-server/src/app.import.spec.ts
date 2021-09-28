import {Test} from '@nestjs/testing';
import {getCustomRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from './config/config.module';
import {ConfigService} from './config/config.service';
import {Connection} from 'typeorm';
import {TransgeneRepository} from './transgene/transgene.repository';
import {Transgene} from './transgene/transgene.entity';
import {Stock} from './stock/stock.entity';
import {StockRepository} from './stock/stock.repository';
import {StockService} from './stock/stock.service';
import {MutationRepository} from './mutation/mutation.repository';
import {Mutation} from './mutation/mutation.entity';
import * as winston from 'winston';
import {Logger} from 'winston';
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from 'nest-winston';
import {utilities as nestWinstonModuleUtilities} from 'nest-winston/dist/winston.utilities';
import {TransgeneService} from './transgene/transgene.service';
import {MutationService} from './mutation/mutation.service';
import {ZfinService} from './zfin/zfin.service';
import {UserService} from './user/user.service';
import {StockImportDto} from './stock/stock-import-dto';
import {UserDTO} from './common/user/UserDTO';
import {User} from './user/user.entity';
import {UserRepository} from './user/user.repository';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {MailerModule, MailerService} from '@nestjs-modules/mailer';
import {PassportModule} from '@nestjs/passport';
import {ZFMailerService} from './mailer/mailer-service';
import {TankRepository} from './tank/tank.repository';
import {TankService} from './tank/tank.service';
import {Stock2tankRepository} from './stock2tank/stock2tank.repository';
import {Stock2tankService} from './stock2tank/stock2tank.service';
import {Tank} from './tank/tank.entity';
import {Stock2tank} from './stock2tank/stock-to-tank.entity';
import {LineageImportDto} from './stock/lineage-import-dto';
import {MarkerImportDto} from './stock/marker-import-dto';
import {HttpModule, HttpService} from '@nestjs/axios';

describe('Import testing', () => {
  let testName: string;
  let logger: Logger;
  let configService: ConfigService;

  let httpService: HttpService;
  let zfinService: ZfinService;

  let jwtService: JwtService;
  let mailerService: MailerService;
  let zfMailer: ZFMailerService;
  let userRepo: UserRepository;
  let userService: UserService;

  let mutationRepo: MutationRepository;
  let mutationService: MutationService;

  let transgeneRepo: TransgeneRepository;
  let transgeneService: TransgeneService;

  let tankRepo: TankRepository;
  let tankService: TankService;

  let swimmerRepo: Stock2tankRepository;
  let swimmerService: Stock2tankService;

  let stockRepo: StockRepository;
  let stockService: StockService;

  let connection: Connection;
  const consoleLog = new (winston.transports.Console)({
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike(),
    ),
  });
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule,
        TypeOrmModule.forRootAsync(
          {
            imports: [ConfigModule],
            useExisting: ConfigService,
          }),
        TypeOrmModule.forFeature([
          Stock, StockRepository,
          Mutation, MutationRepository,
          Transgene, TransgeneRepository,
          User, UserRepository,
          Tank, TankRepository,
          Stock2tank, Stock2tankRepository,
        ]),
        WinstonModule.forRoot({
          transports: [
            consoleLog,
          ],
        }),
        MailerModule.forRootAsync(
          {
            imports: [ConfigModule],
            useExisting: ConfigService,
          }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.jwtSecret,
            signOptions: {expiresIn: configService.jwtDuration},
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        StockRepository,
        {
          provide: getCustomRepositoryToken(Stock),
          useExisting: StockRepository,
        }],
    }).compile();
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
    configService = new ConfigService();

    httpService = module.get(HttpService);
    zfinService = new ZfinService(httpService, configService);

    stockRepo = module.get<StockRepository>(StockRepository);
    userRepo = module.get<UserRepository>(UserRepository);
    mutationRepo = module.get<MutationRepository>(MutationRepository);
    transgeneRepo = module.get<TransgeneRepository>(TransgeneRepository);
    tankRepo = module.get<TankRepository>(TankRepository);
    swimmerRepo = module.get<Stock2tankRepository>(Stock2tankRepository);

    jwtService = module.get(JwtService);
    mailerService = module.get(MailerService);
    userService = new UserService(userRepo, stockRepo, logger, jwtService, zfMailer, configService);

    mutationService = new MutationService(logger, configService, mutationRepo, transgeneRepo, zfinService);

    transgeneService = new TransgeneService(logger, configService, transgeneRepo, mutationRepo, zfinService);

    swimmerService = new Stock2tankService(configService, swimmerRepo);

    tankService = new TankService(logger, tankRepo);

    stockService = new StockService(logger, configService, stockRepo, userService, mutationService, transgeneService);

    connection = module.get(Connection);

  });

  describe('6960271 Import', () => {

    //====================== Import Stocks ===============================
    describe('4947276 Import stock', () => {

      testName = '9059821 import and delete minimal stock';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(4444),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
          countEnteringNursery: 42,
          countLeavingNursery: 43,
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        expect(retrievedStock.countEnteringNursery).toBe(s.countEnteringNursery);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '4321544 import and delete minimal stock with nonsense field';
      it(testName, async () => {
        const s: any = {
          name: String(4445),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
          gnerp: 'gnerp',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '4831332 import a stock with no name';
      it(testName, async () => {
        const s: StockImportDto = {
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        await expect(stockService.import(s)).rejects.toThrow();
      });

      testName = '6090642 import a stock with no fertilization date';
      it(testName, async () => {
        const s: StockImportDto = {
          description: String(Math.random()),
          comment: testName,
        };
        await expect(stockService.import(s)).rejects.toThrow();
      });

      testName = '1435005 import a stock with bad name';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(4302.2),
          description: String(Math.random()),
          comment: testName,
        };
        await expect(stockService.import(s)).rejects.toThrow();
      });

      testName = '6235538 import existing stock name';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(4302.02),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        await expect(stockService.import(s)).rejects.toThrow();
        await stockService.validateAndRemove(retrievedStock.id);
      });
    });

    //====================== Import Sub-Stocks ===============================
    describe('5953656 Import sub-stock', () => {

      const baseStockDto: StockImportDto = {
        name: String(3000),
        description: `base stock 3000`,
        fertilizationDate: '2019-01-01',
        comment: 'importing substocks'
      };
      let baseStock: Stock;

      beforeAll(async () => {
        baseStock = await stockService.import(baseStockDto);
      });

      testName = '2204219 import and delete minimal sub-stock';
      it(testName, async () => {
        const ssDto: StockImportDto = {
          name: String(3000.01),
          description: String(Math.random()),
          fertilizationDate: '2019-01-01',
          comment: testName,
        };
        const ss: Stock = await stockService.import(ssDto);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(ss.id);
        expect(retrievedStock.description).toBe(ssDto.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '2767333 import and delete minimal sub-stock with no base stock';
      it(testName, async () => {
        const s: StockImportDto = {
          name: String(3321.02),
          description: String(Math.random()),
          comment: testName,
          fertilizationDate: '2019-01-01',
        };
        const stock: Stock = await stockService.import(s);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(stock.id);
        expect(retrievedStock.description).toBe(s.description);
        await stockService.validateAndRemove(retrievedStock.id);
      });

      testName = '2204333 import sub-stock various attr mismatches';
      it(testName, async () => {
        const ssDto: StockImportDto = {
          name: String(3000.03),
          description: String(Math.random()),
          fertilizationDate: '2019-01-02',
          comment: testName,
        };
        await expect(stockService.import(ssDto)).rejects.toThrow();
      });

      testName = '9520414 sub-stock, then try to change its lineage';
      it(testName, async () => {
        const ssDto: StockImportDto = {
          name: String(3000.03),
          description: String(Math.random()),
          fertilizationDate: '2019-01-01',
          comment: testName,
        };
        const ss: Stock = await stockService.import(ssDto);
        // retrieve it again
        const retrievedStock: Stock = await stockService.mustExist(ss.id);
        expect(retrievedStock.description).toBe(ssDto.description);
        const lineage: LineageImportDto = {
          stockNumber: String(3000.03),
          externalDadName: 'Fred',
          externalDadDescription: 'Loveable fat guy',
        }
        await expect(stockService.lineageImport(lineage)).rejects.toThrow();
        await stockService.validateAndRemove(retrievedStock.id);
      });

      afterAll(async () => {
        await stockService.validateAndRemove(baseStock.id);
      });
    });

    //====================== Import Mutations ===============================
    describe('6645201 Import mutation', () => {
      testName = '5641327 no name';
      it(testName, async () => {
        const dto = {
          gene: 'test',
          phenotype: String(Math.random()),
          comment: testName,
        };
        await expect(mutationService.import(dto)).rejects.toThrow();
      });

      testName = '4109440 import and delete minimal mutation';
      it(testName, async () => {
        const dto = {
          name: 'fred',
          gene: 'barney',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '4273919 import and delete minimal mutation that is known to ZFIN';
      it(testName, async () => {
        const dto = {
          name: 'fh273',
          gene: 'msgn1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        expect(mut.zfinId).toBe('ZDB-ALT-080325-5');
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '7855585 import and delete minimal mutation that is known to ZFIN, wrong gene name';
      it(testName, async () => {
        const dto = {
          name: 'sw40',
          gene: 'wrongo',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        expect(mut.zfinId).toBe('ZDB-ALT-111220-1');
        expect(mut.gene).toBe('bmpr1bb');
        expect(mut.alternateGeneName).toBe(dto.gene);
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '4179948 import with nickname';
      it(testName, async () => {
        const dto = {
          name: 'test',
          gene: 'test',
          nickname: 'nick',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto);
        // retrieve it again
        mut = await mutationService.mustExist(mut.id);
        expect(mut.phenotype).toBe(dto.phenotype);
        expect(mut.nickname).toBe(dto.nickname);
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '7131086 import with duplicate nickname';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          nickname: 'nick',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test2',
          gene: 'test2',
          nickname: 'nick',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut: Mutation = await mutationService.import(dto1);
        await expect(mutationService.import(dto2)).rejects.toThrow();
        await mutationService.validateAndRemove(mut.id);
      });

      // This is sticky.  We actually allow updates through the import interface
      // for mutations.  The idea was so that we would not have to wipe all the
      // imports from the db and re-do every time we make a change to an import
      // workbook.  Probably a bad idea in the long run.
      testName = '1162941 change a mutation name using import. Ugh.';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test1',
          gene: 'test2',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const mut: Mutation = await mutationService.import(dto1);
        expect(mut.gene).toBe(dto1.gene)
        const updatedMut: Mutation = await mutationService.import(dto2);
        expect(mut.id).toBe(updatedMut.id);
        expect(updatedMut.gene).toBe(dto2.gene)
        await mutationService.validateAndRemove(mut.id);
      });

      testName = '4610472 duplicate gene name ok';
      it(testName, async () => {
        const dto1 = {
          name: 'test1',
          gene: 'test1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          name: 'test2',
          gene: 'test1',
          phenotype: String(Math.random()),
          comment: testName,
        };
        let mut1: Mutation = await mutationService.import(dto1);
        let mut2: Mutation = await mutationService.import(dto2);
        await mutationService.validateAndRemove(mut1.id);
        await mutationService.validateAndRemove(mut2.id);
      });
    });

    //====================== Import Transgenes ===============================
    describe('6645201 Import transgenes', () => {

      testName = '4888462 no allele name';
      it(testName, async () => {
        const dto = {
          descriptor: 'barney',
          source: String(Math.random()),
          comment: testName,
        };
        await expect(transgeneService.import(dto)).rejects.toThrow();
      });

      testName = '7625328 import and delete minimal transgene';
      it(testName, async () => {
        const dto = {
          allele: 'fred',
          descriptor: 'barney',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.source).toBe(dto.source);
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '7324247 import and delete minimal transgene that is known to ZFIN';
      it(testName, async () => {
        const dto = {
          allele: 'y1Tg',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        // the next two fields are filled in by a call to the ZFIN DB.
        expect(tg.descriptor).toBe('Tg(fli1:EGFP)');
        expect(tg.zfinId).toBe('ZDB-ALT-011017-8');
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '8855585 import and delete minimal transgene that is known to ZFIN, wrong descriptor';
      it(testName, async () => {
        const dto = {
          allele: 'y1Tg',
          descriptor: 'wrongo',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.nickname).toBe(`${dto.descriptor}^${dto.allele}`);
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '5279948 import with nickname';
      it(testName, async () => {
        const dto = {
          allele: 'test',
          descriptor: 'test',
          nickname: 'nick',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto);
        // retrieve it again
        tg = await transgeneService.mustExist(tg.id);
        expect(tg.descriptor).toBe(dto.descriptor);
        expect(tg.nickname).toBe(dto.nickname);
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '8331086 import with duplicate nickname';
      it(testName, async () => {
        const dto1 = {
          allele: 'test1',
          descriptor: 'test1',
          nickname: 'nick',
          source: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          allele: 'test2',
          descriptor: 'test2',
          nickname: 'nick',
          source: String(Math.random()),
          comment: testName,
        };
        let tg: Transgene = await transgeneService.import(dto1);
        await expect(transgeneService.import(dto2)).rejects.toThrow();
        await transgeneService.validateAndRemove(tg.id);
      });

      testName = '5510472 duplicate descriptor ok';
      it(testName, async () => {
        const dto1 = {
          allele: 'test1',
          descriptor: 'test1',
          source: String(Math.random()),
          comment: testName,
        };
        const dto2 = {
          allele: 'test2',
          descriptor: 'test1',
          source: String(Math.random()),
          comment: testName,
        };
        let tg1: Transgene = await transgeneService.import(dto1);
        let tg2: Transgene = await transgeneService.import(dto2);
        await transgeneService.validateAndRemove(tg1.id);
        await transgeneService.validateAndRemove(tg2.id);
      });
    });

    //====================== Import users ===============================
    describe('8808458 Import users', () => {

      testName = '9502805 Good user';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
          role: 'guest',
          isPrimaryInvestigator: true,
          isResearcher: true,
          isActive: false,
        };
        let user1: User = await userService.import(dto1);
        user1 = await userService.findOne(user1.id);
        expect(user1.username).toBe(dto1.username);
        expect(user1.name).toBe(dto1.name);
        expect(user1.email).toBe(dto1.email);
        expect(user1.initials).toBe(dto1.initials);
        expect(user1.isActive).toBe(dto1.isActive);
        expect(user1.isResearcher).toBe(dto1.isResearcher);
        expect(user1.isPrimaryInvestigator).toBe(dto1.isPrimaryInvestigator);
        expect(user1.role).toBe(dto1.role);
        await userService.delete(user1.id);
      });

      testName = '9193829 Minimal user';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        let user1: User = await userService.import(dto1);
        user1 = await userService.findOne(user1.id);
        expect(user1.username).toBe(dto1.username);
        expect(user1.name).toBe(dto1.name);
        expect(user1.email).toBe(dto1.email);
        expect(user1.initials).toBe(dto1.initials);
        // Other attributes should be defaults
        expect(user1.isActive).toBe(true);
        expect(user1.isResearcher).toBe(true);
        expect(user1.isPrimaryInvestigator).toBe(false);
        expect(user1.role).toBe('guest');
        // Have to set the user to inactive to delete it
        user1 = await userService.deactivate(user1);
        await userService.delete(user1.id);
      });

      testName = '8796945 Missing name';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '9196945 Missing username';
      it(testName, async () => {
        const dto1: UserDTO = {
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '7796945 Missing email';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          initials: 'FWF',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '7796945 Missing initials';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
        };
        await expect(userService.import(dto1)).rejects.toThrow();
      });

      testName = '9193829 Duplicate fields';
      it(testName, async () => {
        const dto1: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        const dto2: UserDTO = {
          username: 'fred.flintstone',
          name: 'Fred Flintstone',
          email: 'fred.flintstone@nomail.com',
          initials: 'FWF',
        };
        let user1: User = await userService.import(dto1);
        await expect(userService.import(dto2)).rejects.toThrow();
        // Have to set the user to inactive to delete it
        user1 = await userService.deactivate(user1);
        await userService.delete(user1.id);
      });
    });
  });

  //====================== Import Relationships ===============================
  describe('8808458 Import relationships', () => {

    const mut1Dto = {
      name: 'm1',
      gene: 'mg1',
      comment: 'importing relationships'
    };
    const mut2Dto = {
      name: 'm2',
      gene: 'mg2',
      comment: 'importing relationships'
    };

    const tg1Dto = {
      allele: 'tg1',
      descriptor: 'tgD1',
      comment: 'importing relationships'
    }
    const tg2Dto = {
      allele: 'tg2',
      descriptor: 'tgD2',
      comment: 'importing relationships'
    }

    const pi1Dto: UserDTO = {
      username: 'pi1',
      name: 'pi1',
      email: 'upi1@nomail.com',
      initials: 'PIO',
      isResearcher: true,
      isPrimaryInvestigator: true,
    };
    const researcher1Dto: UserDTO = {
      username: 'researcher1',
      name: 'researcher1',
      email: 'researcher1@nomail.com',
      initials: 'RONE',
      isResearcher: true,
      isPrimaryInvestigator: false,
    };
    const researcher2Dto: UserDTO = {
      username: 'researcher2',
      name: 'researcher2',
      email: 'researcher2@nomail.com',
      initials: 'RTWO',
      isResearcher: true,
      isPrimaryInvestigator: false,
    };
    const guestDto: UserDTO = {
      username: 'guest1',
      name: 'guest1',
      email: 'guest1@nomail.com',
      initials: 'GONE',
      isResearcher: false,
      isPrimaryInvestigator: false,
      role: 'guest',
    };

    const baseStockDto: StockImportDto = {
      name: String(4000),
      description: `base stock 4000`,
      fertilizationDate: '2019-01-01',
      comment: 'importing relationships'
    };

    // const tank1Dto: TankDto = {
    //   id: 1,
    //   name: `Tank1`,
    //   sortOrder: '1',
    //   isMultiTank: true,
    // };
    // const tank2Dto: TankDto = {
    //   id: 2,
    //   name: `Tank2`,
    //   sortOrder: '2',
    //   isMultiTank: false,
    // };
    // const tank3Dto: TankDto = {
    //   id: 3,
    //   name: `Tank3`,
    //   sortOrder: '3',
    //   isMultiTank: false,
    // };
    // const tank4Dto: TankDto = {
    //   id: 4,
    //   name: `Tank4`,
    //   sortOrder: '4',
    //   isMultiTank: true,
    // };
    // const tank5Dto: TankDto = {
    //   id: 5,
    //   name: `Tank5`,
    //   sortOrder: '5',
    //   isMultiTank: false,
    // };
    // const tank6Dto: TankDto = {
    //   id: 6,
    //   name: `Tank6`,
    //   isMultiTank: false,
    //   sortOrder: '6',
    // };


    let m1: Mutation;
    let m2: Mutation;
    let tg1: Transgene;
    let tg2: Transgene;
    let pi1: User;
    let researcher1: User;
    let researcher2: User;
    let guest1: User;
    let baseStock: Stock;
    // let tank1: Tank;
    // let tank2: Tank;
    // let tank3: Tank;
    // let tank4: Tank;
    // let tank5: Tank;
    // let tank6: Tank;


    beforeAll(async () => {
      m1 = await mutationService.import(mut1Dto);
      m2 = await mutationService.import(mut2Dto);
      tg1 = await transgeneService.import(tg1Dto);
      tg2 = await transgeneService.import(tg2Dto);
      pi1 = await userService.import(pi1Dto);
      researcher1 = await userService.import(researcher1Dto);
      researcher2 = await userService.import(researcher2Dto);
      guest1 = await userService.import(guestDto);
      baseStock = await stockService.import(baseStockDto);
      // tank1 = await tankService.import(tank1Dto);
      // tank2 = await tankService.import(tank2Dto);
      // tank3 = await tankService.import(tank3Dto);
      // tank4 = await tankService.import(tank4Dto);
      // tank5 = await tankService.import(tank5Dto);
      // tank6 = await tankService.import(tank6Dto);
    });

    testName = '2488606 import stock with parents';
    it(testName, async () => {
      const kidDto: StockImportDto = {
        name: String(4401),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let kid: Stock = await stockService.import(kidDto);
      // re-fetch the kid
      kid = await stockService.mustExist(kid.id);
      const lineageDto: LineageImportDto = {
        stockNumber: String(kid.name),
        internalDad: String(baseStock.name),
        internalMom: String(baseStock.name),
      }
      await stockService.lineageImport(lineageDto);
      const updatedKid: Stock = await stockService.mustExist(kid.id);
      expect(updatedKid.matIdInternal).toBe(baseStock.id);
      expect(updatedKid.patIdInternal).toBe(baseStock.id);
      await stockService.validateAndRemove(kid.id);
    });

    testName = '7741995 import stock with non-existent parents';
    it(testName, async () => {
      const kidDto: StockImportDto = {
        name: String(4402),
        description: String(Math.random()),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let kid: Stock = await stockService.import(kidDto);
      const lineageDto: LineageImportDto = {
        stockNumber: String(4401),
        internalDad: String(baseStock.name),
        internalMom: String(baseStock.name),
      }
      await expect(stockService.lineageImport(lineageDto)).rejects.toThrow();
      await stockService.validateAndRemove(kid.id);
    });

    testName = '8551463 import stock with conflicting parental information ';
    it(testName, async () => {
      const momDto: StockImportDto = {
        name: String(4400),
        description: String(Math.random()),
        comment: 'mom ' + testName,
        fertilizationDate: '2019-01-01',
      };
      const mom: Stock = await stockService.import(momDto);
      const dadDto: StockImportDto = {
        name: String(4401),
        description: String(Math.random()),
        comment: 'dad ' + testName,
        fertilizationDate: '2019-01-02',
      };
      const dad: Stock = await stockService.import(dadDto);
      const kidDto: StockImportDto = {
        name: String(4702),
        description: String(Math.random()),
        comment: 'conflicted kid',
        fertilizationDate: '2020-01-02',
      };
      const kid: Stock = await stockService.import(kidDto);
      const lineage: LineageImportDto = {
        stockNumber: String(kid.name),
        internalDad: String(dad.name),
        internalMom: String(mom.name),
        externalMomName: 'conflicts with internal Mom',
        externalMomDescription: 'conflicts with internal Mom',
        externalDadName: 'conflicts with internal Dad',
        externalDadDescription: 'conflicts with internal Dad',
      };
      await stockService.lineageImport(lineage);
      const updatedStock: Stock = await stockService.mustExist(kid.id);
      expect(updatedStock.externalMatId).toBe(null);
      expect(updatedStock.externalMatDescription).toBe(null);
      await stockService.validateAndRemove(kid.id);
      await stockService.validateAndRemove(mom.id);
      await stockService.validateAndRemove(dad.id);
    });

    testName = '3310190 import stock with researcher';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4403),
        description: String(Math.random()),
        researcherUsername: researcher1.username,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockService.mustExist(stock1.id);
      expect(stock1.researcherId).toBe(researcher1.id);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '9148284 import stock with user who is not a researcher';
    // this is allowed during import because the researcher associated with
    // the stock may have left town long ago.
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4404),
        description: String(Math.random()),
        researcherUsername: guest1.username,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockService.mustExist(stock1.id);
      expect(stock1.researcherId).toBe(guest1.id);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '8748284 import stock with non-existing researcher user';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4405),
        description: String(Math.random()),
        researcherUsername: 'notARealUserJustAName',
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      await expect(stockService.import(stock1Dto)).rejects.toThrow();
    });

    testName = '5645354 import stock with pi';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4406),
        description: String(Math.random()),
        piUsername: pi1.username,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      stock1 = await stockService.mustExist(stock1.id);
      expect(stock1.piId).toBe(pi1.id);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '7530543 import stock with a non exiting user';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4407),
        description: String(Math.random()),
        piUsername: 'notARealUser',
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      await expect(stockService.import(stock1Dto)).rejects.toThrow();
    });

    testName = '7729983 import stock with a mutation';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4408),
        description: testName,
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      const alleleDto: MarkerImportDto = {
        stockName: stock1.name,
        alleles: [m1.name].join(';'),
      }
      await stockService.markerImport(alleleDto);
      stock1 = await stockService.getFullById(stock1.id);
      expect(stock1.mutations.length).toBe(1);
      expect(stock1.mutations[0].name).toBe(mut1Dto.name);
      expect(stock1.mutations[0].gene).toBe(mut1Dto.gene);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '4743085 import stock with a transgene';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4409),
        description: String(Math.random()),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      const alleleDto: MarkerImportDto = {
        stockName: stock1.name,
        alleles: [tg1.allele].join(';'),
      }
      await stockService.markerImport(alleleDto);
      stock1 = await stockService.getFullById(stock1.id);
      expect(stock1.transgenes.length).toBe(1);
      expect(stock1.transgenes[0].allele).toBe(tg1Dto.allele);
      expect(stock1.transgenes[0].descriptor).toBe(tg1Dto.descriptor);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '8293781 import stock multiple transgenes and mutations';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4410),
        description: String(Math.random()),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      const alleleDto: MarkerImportDto = {
        stockName: stock1.name,
        alleles: [tg1.allele, m2.name, m1.name, tg2.allele].join(';'),
      }
      await stockService.markerImport(alleleDto);
      stock1 = await stockService.getFullById(stock1.id);
      expect(stock1.transgenes.length).toBe(2);
      expect(stock1.mutations.length).toBe(2);
      await stockService.validateAndRemove(stock1.id);
    });

    testName = '8651779 import stock with bogus alleles';
    it(testName, async () => {
      const stock1Dto: StockImportDto = {
        name: String(4411),
        description: String(Math.random()),
        comment: testName,
        fertilizationDate: '2019-03-01',
      };
      let stock1: Stock = await stockService.import(stock1Dto);
      const alleleDto: MarkerImportDto = {
        stockName: stock1.name,
        alleles: 'dummy;wrong;alias;tarts',
      }
      await expect(stockService.markerImport(alleleDto)).rejects.toThrow();
      await stockService.validateAndRemove(stock1.id);
    });

    // testName = '82239016 import stock in 1 tank';
    // it(testName, async () => {
    //   const stock1Dto: StockImportDto = {
    //     name: String(4412),
    //     description: String(Math.random()),
    //     comment: testName,
    //     fertilizationDate: '2019-03-01',
    //     tank4Name: 'Tank6',
    //     tank4Count: 324,
    //   };
    //   let stock1 = await stockService.import(stock1Dto);
    //   stock1 = await stockService.getFullById(stock1.id);
    //   expect(stock1.swimmers.length).toBe(1);
    //   await swimmerService.removeSwimmer(stock1.swimmers[0]);
    //   await stockService.validateAndRemove(stock1.id);
    // });
    //
    // testName = '82239016 import stock in 6 tanks';
    // it(testName, async () => {
    //   const stock1Dto: StockImportDto = {
    //     name: String(4413),
    //     description: String(Math.random()),
    //     comment: testName,
    //     fertilizationDate: '2019-03-01',
    //     tank1Name: 'Tank1',
    //     tank1Count: 1,
    //     tank2Name: 'Tank2',
    //     tank2Count: 2,
    //     tank3Name: 'Tank3',
    //     tank3Count: 3,
    //     tank4Name: 'Tank4',
    //     tank4Count: 4,
    //     tank5Name: 'Tank5',
    //     tank5Count: 5,
    //     tank6Name: 'Tank6',
    //     tank6Count: 6,
    //   };
    //   let stock1 = await stockService.import(stock1Dto);
    //   stock1 = await stockService.getFullById(stock1.id);
    //   console.log(JSON.stringify(stock1, null, 2));
    //   await swimmerService.removeSwimmer(stock1.swimmers[0]);
    //   await swimmerService.removeSwimmer(stock1.swimmers[1]);
    //   await swimmerService.removeSwimmer(stock1.swimmers[2]);
    //   await swimmerService.removeSwimmer(stock1.swimmers[3]);
    //   await swimmerService.removeSwimmer(stock1.swimmers[4]);
    //   await swimmerService.removeSwimmer(stock1.swimmers[5]);
    //   await stockService.validateAndRemove(stock1.id);
    // });

    afterAll(async () => {
      await mutationService.validateAndRemove(m1.id);
      await mutationService.validateAndRemove(m2.id);
      await transgeneService.validateAndRemove(tg1.id);
      await transgeneService.validateAndRemove(tg2.id);
      await userService.deactivate(pi1);
      await userService.delete(pi1.id);
      await userService.deactivate(researcher1);
      await userService.delete(researcher1.id);
      await userService.deactivate(researcher2);
      await userService.delete(researcher2.id);
      await userService.deactivate(guest1);
      await userService.delete(guest1.id);
      await stockService.validateAndRemove(baseStock.id);
      // await tankService.validateAndRemove(tank1.id);
      // await tankService.validateAndRemove(tank2.id);
      // await tankService.validateAndRemove(tank3.id);
      // await tankService.validateAndRemove(tank4.id);
      // await tankService.validateAndRemove(tank5.id);
      // await tankService.validateAndRemove(tank6.id);

    });

  });

  afterAll(async () => {
    await connection.close();
  });

});
