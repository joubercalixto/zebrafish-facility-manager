import {TankLabelElementName} from './tank-label-options';

export class TankLabelElementOptions {
  name: TankLabelElementName;
  visible: boolean;
  editable: boolean;
  label: string;
  required: boolean;

  constructor(options: {
    name: TankLabelElementName;
    visible?: boolean;
    editable?: boolean;
    label?: string;
    required?: boolean;
  }) {
    this.name = options.name;
    this.visible = options.visible && true;
    this.editable = options.editable || false;
    this.label = options.label || '';
    this.required = options.required || false;
  }
}
