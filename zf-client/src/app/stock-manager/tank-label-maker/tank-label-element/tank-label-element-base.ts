import {TankLabelElementOptions} from '../../../common/config/tank-label-element-options';

export class TankLabelElementBase<T> {
  private _value: T | undefined;

  key: string;
  label: string;
  required: boolean;
  editable: boolean;
  visibleOnLabel: boolean;

  get value(): T | undefined {
    return this._value;
  }

  set value(value: T | undefined) {
    this._value = value;
  }

  constructor(options: TankLabelElementOptions) {
    this.key = options.name || '';
    this.label = options.label || '';
    this.required = options.required || false;
    this.visibleOnLabel = options.visible && true;
    this.editable = options.editable || false;
  }
}
