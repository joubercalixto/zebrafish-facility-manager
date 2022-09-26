import {LabelPrintingConfig} from './label-printing-config';
import {TankLabelConfig} from './tank-label-config';

// This is a model for the configuration information used by the zf-client

export class ClientConfig {
  facilityName = 'Facility name not configured';
  facilityAbbrv = 'Facility abbreviation not configured';
  facilityPrefix = 'The allele prefix for this facility';

  bestPracticesSite: string;

  hidePI = false;
  hideImportTool = true;
  tankNumberingHint = 'Tank numbering hint not configured';

  labelPrinting: LabelPrintingConfig = new LabelPrintingConfig();

  tankLabel: TankLabelConfig = new TankLabelConfig();

  backgroundColor: string = null;

  zfinAlleleLookupUrl: string;

  allowStockNumberOverride: boolean;

  passwordLength: number;
  passwordRequiresUppercase: boolean;
  passwordRequiresLowercase: boolean;
  passwordRequiresNumbers: boolean;
  passwordRequiresSpecialCharacters: boolean;
  passwordMinimumStrength: number;

  autoAppendTgToOwnedAlleles: boolean;
}
