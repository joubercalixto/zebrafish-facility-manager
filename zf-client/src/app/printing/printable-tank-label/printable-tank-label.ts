import {LabelPrintingOptions} from '../../common/config/label-printing-options';
import {TankLabel} from '../../stock-manager/tank-label-maker/tank-label';
import {classToClass} from 'class-transformer';

// This is the little sibling of the TankLabel, it carries far less data and
// can be serialized and deserialized easily.

export class PrintableTankLabel {
  printConfig: LabelPrintingOptions;
  showQrCode = true;
  stockUrl: string;
  tankLabelElements: string[][] = [];

  constructor() {
  }

  buildFromTankLabel(tankLabel: TankLabel) {
    // Make a copy of some of the options from the TankLabel
    this.printConfig = classToClass(tankLabel.tankLabelOptions.labelPrintingOptions);
    this.showQrCode = tankLabel.showQrCode;
    this.stockUrl = tankLabel.stockUrl;

    // get the data from the TankLabel the label
    for (const row of tankLabel.labelLayout) {
      const r: string[] = [];
      for (const elementName of row) {
        if (tankLabel.labelElements[elementName].visibleOnLabel && tankLabel.labelElements[elementName].value) {
          r.push(tankLabel.labelElements[elementName].value);
        }
      }
      if (r.length > 0) {
        this.tankLabelElements.push(r);
      }
    }
  }
}
