import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TankLabelElementBase} from './tank-label-element-base';

@Component({
  selector: 'app-tank-label-element',
  templateUrl: './tank-label-element.component.html',
  styleUrls: ['./tank-label-element.component.scss']
})
export class TankLabelElementComponent {
  @Input() tankLabelElement!: TankLabelElementBase<string>;
  @Input() form!: FormGroup;

  get isValid() {
    return this.form.controls[this.tankLabelElement.key].valid;
  }
}
