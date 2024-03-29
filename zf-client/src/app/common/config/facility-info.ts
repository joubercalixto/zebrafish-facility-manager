export class FacilityInfo {
  // The name of the Zebrafish Facility. Used in the User Interface
  name = 'Brigham Young University';

  // Used in the User interface in space constricted areas
  shortName = 'BYU';

  // The prefix assigned by ZFIN for the facility.
  // e.g. fh for the Fred Hutchinson Cancer Research Center
  prefix = 'by';

  // The url for the server for this facility.
  url: string;
}
