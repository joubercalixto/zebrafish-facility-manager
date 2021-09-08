// For importing mutations and transgenes for a given stock
// The field names correspond to the required headers in an excel import sheet.

export class MarkerImportDto {
  stockName: string;
  alleles: string;
}

