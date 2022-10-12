import {Component, Input} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {TankLabelElementBase} from './tank-label-element-base';

@Component({
  selector: 'app-tank-label-element',
  templateUrl: './tank-label-element.component.html',
  styleUrls: ['./tank-label-element.component.scss']
})
export class TankLabelElementComponent {
  @Input() tankLabelElement!: TankLabelElementBase<string>;
  @Input() form!: UntypedFormGroup;

  get isValid() {
    return this.form.controls[this.tankLabelElement.key].valid;
  }
}
