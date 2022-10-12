import {TankLabelElementOptions} from './tank-label-element-options';
import {LabelPrintingOptions} from './label-printing-options';

export enum TankLabelElementName {
  STOCK_NUMBER = 'STOCK_NUMBER',
  FERTILIZATION_DATE = 'FERTILIZATION_DATE',
  RESEARCHER_NAME = 'RESEARCHER_NAME',
  RESEARCHER_INITIALS = 'RESEARCHER_INITIALS',
  PI_NAME = 'PI_NAME',
  PI_INITIALS = 'PI_INITIALS',
  MUTATIONS = 'MUTATIONS',
  TRANSGENES = 'TRANSGENES',
  DESCRIPTION = 'DESCRIPTION',
  ADDITIONAL_NOTES = 'ADDITIONAL_NOTES',
  TANK_NUMBER = 'TANK_NUMBER',
  NUMBER_OF_FISH = 'NUMBER_OF_FISH',
}

export class TankLabelOptions {
  showQrCode = false;
  showTankInfo = false;
  labelPrintingOptions: LabelPrintingOptions = new LabelPrintingOptions();
  tankLabelElementOptions: TankLabelElementOptions[][] = [
    [new TankLabelElementOptions({name: TankLabelElementName.STOCK_NUMBER, visible: true, editable: false}),
      new TankLabelElementOptions({name: TankLabelElementName.PI_INITIALS, visible: true, editable: false}),
      new TankLabelElementOptions({name: TankLabelElementName.RESEARCHER_INITIALS, visible: true, editable: false}),
      new TankLabelElementOptions({name: TankLabelElementName.FERTILIZATION_DATE, visible: true, editable: false}),
    ],
    [new TankLabelElementOptions({name: TankLabelElementName.DESCRIPTION, visible: false, editable: false})],
    [new TankLabelElementOptions({name: TankLabelElementName.MUTATIONS, visible: true, editable: false})],
    [new TankLabelElementOptions({name: TankLabelElementName.TRANSGENES, visible: true, editable: false})],
    [new TankLabelElementOptions({name: TankLabelElementName.RESEARCHER_NAME, visible: false, editable: false}),
      new TankLabelElementOptions({name: TankLabelElementName.PI_NAME, visible: true, editable: false}),
    ],
    [
      new TankLabelElementOptions({name: TankLabelElementName.TANK_NUMBER, visible: true, editable: false}),
      new TankLabelElementOptions({name: TankLabelElementName.NUMBER_OF_FISH, visible: true, editable: false}),
    ],
    [new TankLabelElementOptions({name: TankLabelElementName.ADDITIONAL_NOTES, visible: true, editable: false})],
  ];
}
