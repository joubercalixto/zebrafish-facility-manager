import {TankLabelElementBase} from './tank-label-element/tank-label-element-base';
import {TankLabelElementName, TankLabelOptions} from '../../common/config/tank-label-options';
import {StockFullDto} from '../dto/stock-full-dto';
import {classToClass} from 'class-transformer';
import {MutationDto} from '../../mutation-manager/mutation-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';

export class TankLabel {
  showQrCode = true;
  showTankInfo = false;
  stockUrl: string;
  tankLabelOptions: TankLabelOptions;
  labelElements: { [index: string]: TankLabelElementBase<string> } = {};
  labelLayout: string[][] = [];

  constructor(
    private stock: StockFullDto,
    tankLabelOptions: TankLabelOptions,
    private showPI: boolean,
  ) {
    // for building the QR Code
    this.stockUrl = `${location.origin}/stock_manager/view/${(stock) ? stock.id.toString() : ''}`;

    // Make a copy of the tank label options because the user may change them for customizing
    // this particular label.
    this.tankLabelOptions = classToClass(tankLabelOptions);

    // complete the label elements from the stock
    for (const elementOptionsRow of this.tankLabelOptions.tankLabelElementOptions) {
      const row: string[] = [];
      for (const elementOptions of elementOptionsRow) {
        const labelElement = new TankLabelElementBase<string>(elementOptions);
        switch (elementOptions.name) {
          case TankLabelElementName.STOCK_NUMBER: {
            labelElement.value = `S${this.stock.name}`;
            break;
          }
          case TankLabelElementName.FERTILIZATION_DATE: {
            labelElement.value = this.stock.fertilizationDate;
            break;
          }
          case TankLabelElementName.DESCRIPTION: {
            labelElement.value = this.stock.description;
            break;
          }
          case TankLabelElementName.PI_NAME: {
            if (this.showPI && this.stock.piUser) {
              labelElement.value = this.stock.piUser.name;
            }
            break;
          }
          case TankLabelElementName.PI_INITIALS: {
            if (this.showPI && this.stock.piUser) {
              labelElement.value = this.stock.piUser.initials;
            }
            break;
          }
          case TankLabelElementName.RESEARCHER_NAME: {
            if (this.stock.researcherUser) {
              labelElement.value = this.stock.researcherUser.name;
            }
            break;
          }
          case TankLabelElementName.RESEARCHER_INITIALS: {
            if (this.stock.researcherUser) {
              labelElement.value = this.stock.researcherUser.initials;
            }
            break;
          }
          case TankLabelElementName.MUTATIONS: {
            labelElement.value = this.stock.mutations.map((m: MutationDto) => m.fullName).join(', ');
            break;
          }
          case TankLabelElementName.TRANSGENES: {
            labelElement.value = this.stock.transgenes.map((t: TransgeneDto) => t.fullName).join(', ');
            break;
          }
          case TankLabelElementName.ADDITIONAL_NOTES: {
            labelElement.value = '';
            break;
          }
          case TankLabelElementName.TANK_NUMBER: {
            if (this.tankLabelOptions.showTankInfo && this.stock.swimmers.length > 0) {
              labelElement.value = this.stock.swimmers[0].tank.name;
            }
            break;
          }
          case TankLabelElementName.NUMBER_OF_FISH: {
            if (this.tankLabelOptions.showTankInfo && this.stock.swimmers.length > 0) {
              labelElement.value = String(this.stock.swimmers[0].number);
            }
            break;
          }
        }
        this.labelElements[elementOptions.name] = labelElement;
        row.push(elementOptions.name);
      }
      this.labelLayout.push(row);
    }
  }

  selectSwimmer(swimmerIndex: number) {
    if (this.tankLabelOptions.showTankInfo) {
      this.labelElements[TankLabelElementName.TANK_NUMBER].value = this.stock.swimmers[swimmerIndex].tank.name;
      this.labelElements[TankLabelElementName.NUMBER_OF_FISH].value = String(this.stock.swimmers[swimmerIndex].number);
    }
  }
}
