import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {LoggerOptions} from 'typeorm/logger/LoggerOptions';
import {MailerOptions, MailerOptionsFactory} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {ClientConfig} from '../common/config/client-config';
import {FacilityInfo} from '../common/config/facility-info';
import {TankLabelElementOptions} from '../common/config/tank-label-element-options';

export enum ZfmConfigOptions {
  FACILITY_NAME = 'FACILITY_NAME',
  FACILITY_SHORT_NAME = 'FACILITY_SHORT_NAME',
  FACILITY_PREFIX = 'FACILITY_PREFIX',
  FACILITY_URL = 'FACILITY_URL',
  BEST_PRACTICES_SITE = 'BEST_PRACTICES_SITE',
  HIDE_PRIMARY_INVESTIGATOR = 'HIDE_PRIMARY_INVESTIGATOR',
  HIDE_IMPORT_TOOL = 'HIDE_IMPORT_TOOL',
  TANK_NUMBERING_HINT = 'TANK_NUMBERING_HINT',
  LABEL_FONT_SIZE = 'LABEL_FONT_SIZE',
  LABEL_FONT_FAMILY = 'LABEL_FONT_FAMILY',
  LABEL_HEIGHT_IN_INCHES = 'LABEL_HEIGHT_IN_INCHES',
  LABEL_WIDTH_IN_INCHES = 'LABEL_WIDTH_IN_INCHES',
  LABEL_SHOW_QR_CODE = 'LABEL_SHOW_QR_CODE',
  LABEL_SHOW_TANK_INFO = 'LABEL_SHOW_TANK_INFO',
  GUI_BACKGROUND = 'GUI_BACKGROUND',
  ZFIN_ALLELE_LOOKUP_URL = 'ZFIN_ALLELE_LOOKUP_URL',
  ALLOW_STOCK_NUMBER_OVERRIDE = 'ALLOW_STOCK_NUMBER_OVERRIDE',
  PASSWORD_LENGTH = 'PASSWORD_LENGTH',
  PASSWORD_MINIMUM_STRENGTH = 'PASSWORD_MINIMUM_STRENGTH',
  PASSWORD_REQUIRES_UPPERCASE = 'PASSWORD_REQUIRES_UPPERCASE',
  PASSWORD_REQUIRES_LOWERCASE = 'PASSWORD_REQUIRES_LOWERCASE',
  PASSWORD_REQUIRES_NUMBERS = 'PASSWORD_REQUIRES_NUMBERS',
  PASSWORD_REQUIRES_SPECIAL_CHARACTERS = 'PASSWORD_REQUIRES_SPECIAL_CHARACTERS',
  AUTO_APPEND_Tg_TO_OWNED_ALLELES = 'AUTO_APPEND_Tg_TO_OWNED_ALLELES',
  TANK_LABEL_LAYOUT = 'TANK_LABEL_LAYOUT',
}
export interface EnvConfig {
  [prop: string]: string;
}

export class ConfigService implements MailerOptionsFactory, TypeOrmOptionsFactory {
  private readonly envConfig: EnvConfig;
  private readonly _clientConfig: ClientConfig = new ClientConfig();
  readonly facility: string; // which facility are we talking about

  constructor() {
    this.facility = process.env.FACILITY;

    if (!this.facility) {
      throw new Error('You must set a FACILITY environment variable before running the' +
        ' Zebrafish Facility Management server. export FACILITY=some_facility_identifier' +
        '  The system will then look for the server\'s configuration file in the file' +
        ' environments/some_facility_identifier.env')
    }

    const filePath = `environments/${this.facility}.env`;
    if (!fs.existsSync(filePath)) {
      throw new Error(`You have set the FACILITY to ${this.facility}, but
      the expected configuration file was not found at ${filePath}`);
    }
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = ConfigService.validateInput(config);
    this.buildClientConfig();
  }

  get clientConfig(): ClientConfig {
    return this._clientConfig;
  }

  get port(): number {
    return Number(this.envConfig.PORT);
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get typeORMLogQueries(): boolean {
    return Boolean(this.envConfig.TYPEORM_LOG_QUERIES);
  }

  get typeORMSync(): boolean {
    return Boolean(this.envConfig.TYPEORM_SYNC_DATABASE);
  }

  get typeORMMigrationRun(): boolean {
    return Boolean(this.envConfig.TYPEORM_MIGRATION_RUN);
  }

  get facilityInfo(): FacilityInfo {
    return this.clientConfig.facilityInfo;
  }

  // This is so the system can set up a default admin user
  get defaultAdminUserName(): string {
    return this.envConfig.DEFAULT_ADMIN_USER_NAME;
  }

  get defaultAdminUserEmail(): string {
    return this.envConfig.DEFAULT_ADMIN_USER_EMAIL;
  }

  get defaultAdminUserPassword(): string {
    return this.envConfig.DEFAULT_ADMIN_USER_PASSWORD;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get jwtDuration(): string {
    return this.envConfig.JWT_DURATION;
  }

  get zfinAlleleLookupUrl(): string {
    return this.envConfig.ZFIN_ALLELE_LOOKUP_URL;
  }

  get allowStockNumberOverride(): boolean {
    return Boolean(this.envConfig.ALLOW_STOCK_NUMBER_OVERRIDE);
  }

  get allowRegexStockSearch(): boolean {
    return Boolean(this.envConfig.ALLOW_REGEX_STOCK_SEARCH);
  }

  // This is used to build a ClientConfig object to send to the client
  buildClientConfig() {
    const c = this._clientConfig;
    c.facilityInfo.name = this.envConfig[ZfmConfigOptions.FACILITY_NAME];
    c.facilityInfo.shortName = this.envConfig[ZfmConfigOptions.FACILITY_SHORT_NAME];
    c.facilityInfo.prefix = this.envConfig[ZfmConfigOptions.FACILITY_PREFIX];
    c.facilityInfo.url = this.envConfig[ZfmConfigOptions.FACILITY_URL];
    c.bestPracticesSite = this.envConfig[ZfmConfigOptions.BEST_PRACTICES_SITE];
    c.hidePI = Boolean(this.envConfig[ZfmConfigOptions.HIDE_PRIMARY_INVESTIGATOR]);
    c.hideImportTool = Boolean(this.envConfig[ZfmConfigOptions.HIDE_IMPORT_TOOL]);
    c.tankNumberingHint = this.envConfig[ZfmConfigOptions.TANK_NUMBERING_HINT];
    c.tankLabelOptions.labelPrintingOptions.fontPointSize = Number(this.envConfig[ZfmConfigOptions.LABEL_FONT_SIZE]);
    c.tankLabelOptions.labelPrintingOptions.fontFamily = this.envConfig[ZfmConfigOptions.LABEL_FONT_FAMILY];
    c.tankLabelOptions.labelPrintingOptions.heightInInches = Number(this.envConfig[ZfmConfigOptions.LABEL_HEIGHT_IN_INCHES]);
    c.tankLabelOptions.labelPrintingOptions.widthInInches = Number(this.envConfig[ZfmConfigOptions.LABEL_WIDTH_IN_INCHES]);
    c.tankLabelOptions.showQrCode = Boolean(this.envConfig[ZfmConfigOptions.LABEL_SHOW_QR_CODE]);
    c.tankLabelOptions.showTankInfo = Boolean(this.envConfig[ZfmConfigOptions.LABEL_SHOW_TANK_INFO]);
    c.backgroundColor = this.envConfig[ZfmConfigOptions.GUI_BACKGROUND];
    c.zfinAlleleLookupUrl = this.envConfig[ZfmConfigOptions.ZFIN_ALLELE_LOOKUP_URL];
    c.allowStockNumberOverride = Boolean(this.envConfig[ZfmConfigOptions.ALLOW_STOCK_NUMBER_OVERRIDE]);
    c.passwordLength = Number(this.envConfig[ZfmConfigOptions.PASSWORD_LENGTH]);
    c.passwordMinimumStrength = Number(this.envConfig[ZfmConfigOptions.PASSWORD_MINIMUM_STRENGTH]);
    c.passwordRequiresUppercase = Boolean(this.envConfig[ZfmConfigOptions.PASSWORD_REQUIRES_UPPERCASE]);
    c.passwordRequiresLowercase = Boolean(this.envConfig[ZfmConfigOptions.PASSWORD_REQUIRES_LOWERCASE]);
    c.passwordRequiresNumbers = Boolean(this.envConfig[ZfmConfigOptions.PASSWORD_REQUIRES_NUMBERS]);
    c.passwordRequiresSpecialCharacters = Boolean(this.envConfig[ZfmConfigOptions.PASSWORD_REQUIRES_SPECIAL_CHARACTERS]);
    c.autoAppendTgToOwnedAlleles = Boolean(this.envConfig[ZfmConfigOptions.AUTO_APPEND_Tg_TO_OWNED_ALLELES]);
    const tankLabelElementOptions: string = String(this.envConfig[ZfmConfigOptions.TANK_LABEL_LAYOUT]);
    if (tankLabelElementOptions) {
      this._clientConfig.tankLabelOptions.tankLabelElementOptions = ConfigService.validateTankLabelLayout(tankLabelElementOptions);
    }
  }

  // The tank label layout is written as a JSON array of arrays of TankLabelElementOptions.
  // Each array in the outer array represents a set of elements that get printed in a row on the label.
  // Every possible TankLabelElementName should be in the tankLayoutOptions. Any that are not
  // there will not be shown on any label.
  // This function will cause a failure at startup if the configuration is wrong.
  private static validateTankLabelLayout(tankLabelLayout: string): TankLabelElementOptions[][] {
    const labelOptionsSchema: Joi.ArraySchema = Joi.array().items(Joi.array().items(Joi.object({
      name: Joi.string().required(),
      visible: Joi.boolean().default(true),
      editable: Joi.boolean().default(false),
      required: Joi.boolean().default(false),
      label: Joi.string()
    })));
    const tankLabelElementOptions: TankLabelElementOptions[][] = JSON.parse(tankLabelLayout);
    const {error, value: validatedTankLabelLayout} = labelOptionsSchema.validate(tankLabelElementOptions);
    if (error) {
      throw new Error(`Tank label layout configuration error: ${error.message}`);
    }
    // console.log(`validated tank label options: ${JSON.stringify(tankLabelElementOptions, null, 2)}`);

    return tankLabelElementOptions;
  }

  // The following schema says what the legal contents of the dotenv file are.
  // Ensures all needed variables are set, and returns the validated JavaScript object
  // including the applied default values.
  private static validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string().default('production'),

      FACILITY_NAME: Joi.string().required(),
      FACILITY_SHORT_NAME: Joi.string().required(),
      FACILITY_PREFIX: Joi.string().required(),
      FACILITY_URL: Joi.string().required(),

      PORT: Joi.number().required(),

      DB_NAME: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      DB_HOST: Joi.string().optional().default('localhost'),
      DB_SSL_PROFILE: Joi.string().optional().default(null),

      TYPEORM_SYNC_DATABASE: Joi.boolean().default(false),
      TYPEORM_MIGRATION_RUN: Joi.boolean().default(false),
      TYPEORM_LOG_QUERIES: Joi.boolean().default(false),

      JWT_SECRET: Joi.string().required(),
      JWT_DURATION: Joi.string().required(),

      MAIL_FROM: Joi.string().required(),
      MAIL_REPLY_TO: Joi.string().required(),
      MAIL_CC: Joi.string().required(),
      MAIL_HOST: Joi.string().required(),
      MAIL_USER: Joi.string().required(),
      MAIL_PASSWORD: Joi.string().required(),

      DEFAULT_ADMIN_USER_NAME: Joi.string().required(),
      DEFAULT_ADMIN_USER_EMAIL: Joi.string().required(),
      DEFAULT_ADMIN_USER_PASSWORD: Joi.string().required(),

      BEST_PRACTICES_SITE: Joi.string().default('https://zebrafishfacilitymanager.com/best-practices'),

      ZFIN_ALLELE_LOOKUP_URL: Joi.string().default('https://zfin.zebrafishfacilitymanager.com'),

      HIDE_PRIMARY_INVESTIGATOR: Joi.boolean().default(false),
      HIDE_IMPORT_TOOL: Joi.boolean().default(true),
      TANK_NUMBERING_HINT: Joi.string().default('Tank numbering hint not configured'),

      LABEL_FONT_SIZE: Joi.number().default(11),
      LABEL_FONT_FAMILY: Joi.string().default('Helvetica'),
      LABEL_HEIGHT_IN_INCHES: Joi.number().default(1.25),
      LABEL_WIDTH_IN_INCHES: Joi.number().default(3.5),

      LABEL_SHOW_QR_CODE: Joi.boolean().default(true),
      LABEL_SHOW_TANK_INFO: Joi.boolean().default(false),

      TANK_LABEL_LAYOUT: Joi.string(),

      GUI_BACKGROUND: Joi.string().default(null),
      PASSWORD_LENGTH: Joi.number().default(0),
      PASSWORD_MINIMUM_STRENGTH: Joi.number().default(0),
      PASSWORD_REQUIRES_UPPERCASE: Joi.boolean().default(false),
      PASSWORD_REQUIRES_LOWERCASE: Joi.boolean().default(false),
      PASSWORD_REQUIRES_NUMBERS: Joi.boolean().default(false),
      PASSWORD_REQUIRES_SPECIAL_CHARACTERS: Joi.boolean().default(false),
      ALLOW_STOCK_NUMBER_OVERRIDE: Joi.boolean().default(false),
      ALLOW_REGEX_STOCK_SEARCH: Joi.boolean().default(false),
      AUTO_APPEND_Tg_TO_OWNED_ALLELES: Joi.boolean().default(false),
    });

    const {error, value: validatedEnvConfig} = envVarsSchema.validate(
      envConfig,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  // This is used to build ORM configuration options
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    const SOURCE_PATH = this.nodeEnv === 'production' ? 'dist' : 'src';
    const loggingOption: LoggerOptions = ['error'];
    if (this.typeORMLogQueries) {
      loggingOption.push('query');
    }

    if (this.envConfig.DB_SSL_PROFILE) {
      return {
        type: 'mariadb',
        host: this.envConfig.DB_HOST,
        port: 3306,
        username: this.envConfig.DB_USER,
        password: this.envConfig.DB_PASSWORD,
        database: this.envConfig.DB_NAME,
        entities: [
          `${SOURCE_PATH}/**/*.entity{.ts,.js}`,
        ],
        synchronize: this.typeORMSync,
        'migrations': [`${SOURCE_PATH}/migrations/*{.ts,.js}`],
        'migrationsRun': this.typeORMMigrationRun,
        logging: loggingOption,
        ssl: 'Amazon RDS',
      };
    } else
      return {
        type: 'mariadb',
        host: this.envConfig.DB_HOST,
        port: 3306,
        username: this.envConfig.DB_USER,
        password: this.envConfig.DB_PASSWORD,
        database: this.envConfig.DB_NAME,
        entities: [
          `${SOURCE_PATH}/**/*.entity{.ts,.js}`,
        ],
        synchronize: this.typeORMSync,
        'migrations': [`${SOURCE_PATH}/migrations/*{.ts,.js}`],
        'migrationsRun': this.typeORMMigrationRun,
        logging: loggingOption,
      };
  }

  // For more information and options read https://nodemailer.com
  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      defaults: {
        from: this.envConfig.MAIL_FROM,
        replyTo: this.envConfig.MAIL_REPLY_TO,
        cc: this.envConfig.MAIL_CC,
      },
      transport: {
        host: this.envConfig.MAIL_HOST,
        port: 587,
        secure: false, // the session will use STARTTLS
        auth: {
          user: this.envConfig.MAIL_USER,
          pass: this.envConfig.MAIL_PASSWORD,
        }
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }
  }
}
