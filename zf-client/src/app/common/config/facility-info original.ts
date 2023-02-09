export class FacilityInfo {
  // The name of the Zebrafish Facility. Used in the User Interface
  name = 'Facility name not configured';

  // Used in the User interface in space constricted areas
  shortName = 'Facility abbreviation not configured';

  // The prefix assigned by ZFIN for the facility.
  // e.g. fh for the Fred Hutchinson Cancer Research Center
  prefix = 'The allele prefix for this facility';

  // The url for the server for this facility.
  url: string;
}
