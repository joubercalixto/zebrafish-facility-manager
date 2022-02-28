import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import {TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {LoggerOptions} from 'typeorm/logger/LoggerOptions';
import {MailerOptions, MailerOptionsFactory} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {ClientConfig} from '../common/config/client-config';

export interface EnvConfig {
  [prop: string]: string;
}

class FacilityDto {
  name: string;
  short_name: string;
  prefix: string;
  url: string;
}

export class ConfigService implements MailerOptionsFactory, TypeOrmOptionsFactory {
  private readonly envConfig: EnvConfig;
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
  }

  get port(): number {
    return Number(this.envConfig.PORT);
  }

  get bestPracticesSite(): string {
    return this.envConfig.BEST_PARACTICES_SITE;
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

  get facilityInfo(): FacilityDto {
    return {
      name: this.envConfig.FACILITY_NAME,
      short_name: this.envConfig.FACILITY_SHORT_NAME,
      prefix: this.envConfig.FACILITY_PREFIX,
      url: this.envConfig.FACILITY_URL,
    };
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

  // This is used to build a ClientConfig object to send to the client
  get clientConfig(): ClientConfig {
    const c = new ClientConfig();
    c.facilityName = this.envConfig.FACILITY_NAME;
    c.facilityAbbrv = this.envConfig.FACILITY_SHORT_NAME;
    c.facilityPrefix = this.envConfig.FACILITY_PREFIX;
    c.hidePI = Boolean(this.envConfig.HIDE_PRIMARY_INVESTIGATOR);
    c.hideImportTool = Boolean(this.envConfig.HIDE_IMPORT_TOOL);
    c.tankNumberingHint = this.envConfig.TANK_NUMBERING_HINT;
    c.labelPrinting.fontPointSize = Number(this.envConfig.LABEL_FONT_SIZE);
    c.labelPrinting.fontFamily = this.envConfig.LABEL_FONT_FAMILY;
    c.labelPrinting.heightInInches = Number(this.envConfig.LABEL_HEIGHT_IN_INCHES);
    c.labelPrinting.widthInInches = Number(this.envConfig.LABEL_WIDTH_IN_INCHES);
    c.tankLabel.showQrCode = Boolean(this.envConfig.LABEL_SHOW_QR_CODE);
    c.tankLabel.showStockNumber = Boolean(this.envConfig.LABEL_SHOW_STOCK_NUMBER);
    c.tankLabel.showPiName = Boolean(this.envConfig.LABEL_SHOW_PRIMARY_INVESTIGATOR_NAME);
    c.tankLabel.showPiInitials = Boolean(this.envConfig.LABEL_SHOW_PRIMARY_INVESTIGATOR_INITIALS);
    c.tankLabel.showResearcherName = Boolean(this.envConfig.LABEL_SHOW_RESEARCHER_NAME);
    c.tankLabel.showResearcherInitials = Boolean(this.envConfig.LABEL_SHOW_RESEARCHER_INITIALS);
    c.tankLabel.showFertilizationDate = Boolean(this.envConfig.LABEL_SHOW_FERTILIZATION_DATE);
    c.tankLabel.showDescription = Boolean(this.envConfig.LABEL_SHOW_DESCRIPTION);
    c.tankLabel.showMutations = Boolean(this.envConfig.LABEL_SHOW_MUTATIONS);
    c.tankLabel.showTransgenes = Boolean(this.envConfig.LABEL_SHOW_TRANSGENES);
    c.tankLabel.showAdditionalNote = Boolean(this.envConfig.LABEL_SHOW_ADDITIONAL_NOTES);
    c.backgroundColor = this.envConfig.GUI_BACKGROUND;
    c.zfinAlleleLookupUrl = this.envConfig.ZFIN_ALLELE_LOOKUP_URL;
    c.allowStockNumberOverride = Boolean(this.envConfig.ALLOW_STOCK_NUMBER_OVERRIDE);
    c.passwordLength = Number(this.envConfig.PASSWORD_LENGTH);
    c.passwordMinimumStrength = Number(this.envConfig.PASSWORD_MINIMUM_STRENGTH);
    c.passwordRequiresUppercase = Boolean(this.envConfig.PASSWORD_REQUIRES_UPPERCASE);
    c.passwordRequiresLowercase = Boolean(this.envConfig.PASSWORD_REQUIRES_LOWERCASE);
    c.passwordRequiresNumbers = Boolean(this.envConfig.PASSWORD_REQUIRES_NUMBERS);
    c.passwordRequiresSpecialCharacters = Boolean(this.envConfig.PASSWORD_REQUIRES_SPECIAL_CHARACTERS);
    c.autoAppendTgToOwnedAlleles = Boolean(this.envConfig.AUTO_APPEND_Tg_TO_OWNED_ALLELES);
    return c;
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
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

      BEST_PRACTICES_SITE: Joi.string().default('https://zebrafishfacilitymanager.com'),

      ZFIN_ALLELE_LOOKUP_URL: Joi.string().default('https://zfin.zebrafishfacilitymanager.com'),

      HIDE_PRIMARY_INVESTIGATOR: Joi.boolean().default(false),
      HIDE_IMPORT_TOOL: Joi.boolean().default(true),
      TANK_NUMBERING_HINT: Joi.string().default('Tank numbering hint not configured'),
      LABEL_FONT_SIZE: Joi.number().default(11),
      LABEL_FONT_FAMILY: Joi.string().default('Helvetica'),
      LABEL_HEIGHT_IN_INCHES: Joi.number().default(1.25),
      LABEL_WIDTH_IN_INCHES: Joi.number().default(3.5),
      LABEL_SHOW_QR_CODE: Joi.boolean().default(true),
      LABEL_SHOW_STOCK_NUMBER: Joi.boolean().default(true),
      LABEL_SHOW_PRIMARY_INVESTIGATOR_NAME: Joi.boolean().default(false),
      LABEL_SHOW_PRIMARY_INVESTIGATOR_INITIALS: Joi.boolean().default(true),
      LABEL_SHOW_RESEARCHER_NAME: Joi.boolean().default(true),
      LABEL_SHOW_RESEARCHER_INITIALS: Joi.boolean().default(false),
      LABEL_SHOW_FERTILIZATION_DATE: Joi.boolean().default(true),
      LABEL_SHOW_DESCRIPTION: Joi.boolean().default(true),
      LABEL_SHOW_MUTATIONS: Joi.boolean().default(true),
      LABEL_SHOW_TRANSGENES: Joi.boolean().default(true),
      LABEL_SHOW_ADDITIONAL_NOTES: Joi.boolean().default(true),
      GUI_BACKGROUND: Joi.string().default(null),
      PASSWORD_LENGTH: Joi.number().default(0),
      PASSWORD_MINIMUM_STRENGTH: Joi.number().default(0),
      PASSWORD_REQUIRES_UPPERCASE: Joi.boolean().default(false),
      PASSWORD_REQUIRES_LOWERCASE: Joi.boolean().default(false),
      PASSWORD_REQUIRES_NUMBERS: Joi.boolean().default(false),
      PASSWORD_REQUIRES_SPECIAL_CHARACTERS: Joi.boolean().default(false),
      ALLOW_STOCK_NUMBER_OVERRIDE: Joi.boolean().default(false),
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

  // This is used to build Mailer configuration options

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
