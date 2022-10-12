import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';
import {StockFullDto} from '../dto/stock-full-dto';
import {ActivatedRoute, Router} from '@angular/router';
import {PrintService} from '../../printing/print.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {classToPlain} from 'class-transformer';
import {TankLabel} from './tank-label';
import {PrintableTankLabel} from '../../printing/printable-tank-label/printable-tank-label';

@Component({
  selector: 'app-tank-label-maker',
  templateUrl: './tank-label-maker.component.html',
  styleUrls: ['./tank-label-maker.component.scss']
})
export class TankLabelMakerComponent implements OnInit {
  stock: StockFullDto;
  label: TankLabel;
  tankLabelFormGroup: UntypedFormGroup;
  selectedSwimmerFC: UntypedFormControl;
  selectedSwimmerIndex: number;

  // How about a helping of lame sauce with this menu?
  fonts = ['Roboto', 'Arial', 'Arial Narrow', 'Arial Black', 'Calibri', 'Helvetica', 'PT Sans'];

  constructor(
    public appState: AppStateService,
    private stockService: StockService,
    private printService: PrintService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.stock = this.stockService.selected;
    this.initialize();
    this.route.params.subscribe(params => {
      if (undefined !== (params.swimmerIndex)) {
        this.selectedSwimmerIndex = Number(params.swimmerIndex);
        this.selectSwimmer();
      }
    });
  }

  initialize() {
    this.label = new TankLabel(
      this.stockService.selected,
      this.appState.facilityConfig.tankLabelOptions,
      !this.appState.facilityConfig.hidePI,
    );


    const group: any = {};
    for (const key of Object.keys(this.label.labelElements)) {
      group[key] = new UntypedFormControl(this.label.labelElements[key].value);
    }
    this.tankLabelFormGroup = new UntypedFormGroup(group);
    if (this.stock.swimmers.length > 0) {
      this.tankLabelFormGroup.registerControl('selectedSwimmerFC', new UntypedFormControl(0));
    }
  }

  selectSwimmer() {
    this.label.selectSwimmer(this.selectedSwimmerIndex);
    // this.label.selectSwimmer(Number(this.tankLabelFormGroup.get('selectedSwimmerFC').value));
  }

  changeFontSize(amount: number) {
    this.label.tankLabelOptions.labelPrintingOptions.fontPointSize =
      this.label.tankLabelOptions.labelPrintingOptions.fontPointSize + amount;
  }

  done() {
    this.router.navigateByUrl(ZFTool.STOCK_MANAGER.route + '/view').then();
  }

  revert() {
    this.initialize();
  }

  print() {
    // We just generate a printable tank label and stick it in the appState before we
    // go to print it. The printer just fetches from there.
    // This is the easiest way to get the data for the label from here to there.
    // We could do it through navigation parameters, but that is just a pain in
    // the ass, and since the app state is around anyway - this seems like a good idea.
    const printableLabel = new PrintableTankLabel();
    printableLabel.buildFromTankLabel(this.label);
    this.appState.setState('tankLabel', classToPlain(printableLabel), false);
    this.printService.printDocument('tankLabel');
  }

}

