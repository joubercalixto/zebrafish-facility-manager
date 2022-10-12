import {TankLabelOptions} from './tank-label-options';
import {FacilityInfo} from './facility-info';

// This is a model for the configuration information used by the zf-client.
// The default values can all be overridden in the configuration of the system
// for a specific facility.

export class ClientConfig {
  // Information about the Zebrafish facility
  facilityInfo: FacilityInfo = new FacilityInfo();

  // The website where some useful information about using the system is found.
  bestPracticesSite = 'https://zebrafishfacilitymanager.com';

  // Reduce clutter if the facility has only one PI.
  hidePI = false;

  // Tank numbering varies wildly from facility to facility. This is just a text
  // hint that shows in the user interface when the user may forget what the tank
  // numbering scheme is at their facility.
  tankNumberingHint = 'Tank numbering hint not configured';

  // This is a big structure that says what and how to lay out labels for a facility.
  // There are lots of options and defaults nested in here.
  tankLabelOptions: TankLabelOptions = new TankLabelOptions();

  // Options for setting up password requirements for a given facility.
  passwordLength: number;
  passwordRequiresUppercase: boolean;
  passwordRequiresLowercase: boolean;
  passwordRequiresNumbers: boolean;
  passwordRequiresSpecialCharacters: boolean;
  passwordMinimumStrength: number;

  // When creating and "owned" transgene, the allele is generated. Transgene alleles
  // generally, but not always, should have a Tg attached to them.  E.g. fh273Tg.
  autoAppendTgToOwnedAlleles = true;

  // In early deployment, allow user to specify a stock number instead of automatically assigning one.
  // This should never be true in live deployment.
  allowStockNumberOverride = false;

  // Only used in system setup to import data into the system en-mass using spreadsheets.
  // Should never be false in production.
  hideImportTool = true;

  // The URL the system should use to find out if a particular allele name is
  // "known to ZFIN". It should never change, but it is configurable to allow
  // developing against a test lookup site.
  zfinAlleleLookupUrl = 'https://zfin.zebrafishfacilitymanager.com';

  // Only used in development to color the background of the UI to help the developer know
  // which of their many systems they are using.
  backgroundColor: string = null;
}
