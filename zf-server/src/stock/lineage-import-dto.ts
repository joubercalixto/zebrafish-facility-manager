// For importing stock lineage
// The field names correspond to the required headers in an excell import sheet.

export class LineageImportDto {
  stockNumber: string;
  internalMom?: string;
  internalDad?: string;
  externalMomName?: string;
  externalMomDescription?: string;
  externalDadName?: string;
  externalDadDescription?: string;
}

