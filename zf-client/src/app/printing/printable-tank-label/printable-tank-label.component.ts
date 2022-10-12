import {Component, OnInit} from '@angular/core';
import {PrintService} from '../print.service';
import {AppStateService} from '../../app-state.service';
import {PrintableTankLabel} from './printable-tank-label';
import {plainToClass} from 'class-transformer';


@Component({
  selector: 'app-printable-tank-label',
  templateUrl: './printable-tank-label.component.html',
  styleUrls: ['./printable-tank-label.component.scss']
})
export class PrintableTankLabelComponent implements OnInit {
  // tslint is wrong about the next row, it is used by the qr code generator in the html, albeit with eval
  stockUrl: string;
  label: PrintableTankLabel;

  constructor(
    public appState: AppStateService,
    private printService: PrintService,
  ) {
  }

  ngOnInit() {
    // The assumption is that before this gets invoked, the invoker stuffs the data
    // for the label in the appState, and now we just go fetch it.  It may be a
    // suboptimal design, but it is really easy.
    this.label = plainToClass(PrintableTankLabel, this.appState.getState('tankLabel'));
    this.printService.onDataReady();
  }
}
