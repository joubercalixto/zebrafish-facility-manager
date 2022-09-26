
export class StockFilter {
  text: string = null;
  liveStocksOnly = false;
  number: string = null;
  tankName: string = null;
  mutation: string = null;
  mutationId: number = null;
  transgene: string = null;
  transgeneId: number = null;
  age: number = null;
  // The following is NOT unused.
  // It is used when a Form value (with an age-modifier form field) is used to fill a StockFilter.
  ageModifier: string = null;
  researcherId: string = null;
  piId: string = null;

  public constructor(init?: Partial<StockFilter>) {
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(
      this.text || this.liveStocksOnly || this.number ||
      this.tankName || this.mutation || this.transgene ||
      this.mutationId || this.transgeneId || this.age ||
      this.researcherId || this.piId);
  }
}
