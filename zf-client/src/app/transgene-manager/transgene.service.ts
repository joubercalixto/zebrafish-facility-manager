import {Inject, Injectable} from '@angular/core';
import {LoaderService, ZFTypes} from '../loader.service';
import {TransgeneFilter} from './transgene-filter';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import {BehaviorSubject} from 'rxjs';
import {Transgene} from './transgene';
import * as XLSX from 'xlsx';
import {AppStateService, ZFStates} from '../app-state.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {plainToClass} from "class-transformer";

/**
 * This is the model for transgene information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class TransgeneService extends ZFGenericService<Transgene, Transgene, TransgeneFilter> {

  // This is a cache that is used in several places.
  // It is only refreshed when the user performs some operation that will
  // change the content of the cache.
  // TODO it probably should refresh automatically periodically.
  private _all$: BehaviorSubject<Transgene[]> = new BehaviorSubject<Transgene[]>([]);
  get all(): Transgene[] { return this._all$.value; }

  // Note that initialization is done in the constructor here as ngOnInit is not called for services
  constructor(
    private readonly loaderForGeneric: LoaderService,
    private snackBarForGeneric: MatSnackBar,
    private appStateServiceX: AppStateService,
  ) {
    super(ZFTypes.TRANSGENE, loaderForGeneric, snackBarForGeneric, appStateServiceX);
    const storedFilter  = this.appStateServiceX.getState(ZFTypes.TRANSGENE, ZFStates.FILTER);
    if (storedFilter) {
      this.setFilter(storedFilter);
    } else {
      const filter = plainToClass(TransgeneFilter, {});
      console.log(ZFTypes.TRANSGENE + ' empty filter: ' + JSON.stringify(filter));
      this.setFilter(filter);
    }

    this._fieldOptions = new FieldOptions({
      'nameValidation': [],
      'source': [],
    });
    this.refresh();
  }

  // Data comes from the server as a plain dto, this just converts to the corresponding class
  convertSimpleDto2Class(dto): any {
    return plainToClass(Transgene, dto);
  }

  // Data comes from the server as a dto, this just converts to the corresponding class
  convertFullDto2Class(dto): any {
    return plainToClass(Transgene, dto);
  }

  refresh() {
    super.refresh();
    this.loadAllTransgenes();
  }

  loadAllTransgenes() {
    this.loader.getFilteredList(ZFTypes.TRANSGENE, {}).subscribe((data) => {
      this._all$.next(data.map(m => this.convertSimpleDto2Class(m)));
      // this.setFilter(this.filter);
    });
  }

  uniquenessValidator(name: string): boolean {
    return this._fieldOptions.options.nameValidation.includes(name);
  }

  toExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.all.map((m: Transgene) => {
      return {Descriptor: m.descriptor, Allele: m.allele, Source: m.source, Plasmid: m.plasmid, Comment: m.comment};
    }));
    XLSX.utils.book_append_sheet(wb, ws, 'Transgenes');
    ws['!cols'] = [ {wch: 35}, {wch: 8}, {wch: 24}, {wch: 50}, {wch: 50}];

    let data: string [][];
    if (!this.filter || this.filter.isEmpty()) {
      data = [
        ['This workbook lists all transgenes.']
      ];
    } else {
      data = [
        ['This book lists any transgene containing the string: "' + this.filter.text +
        '" in the allele, descriptor, source, plasmid or comment.'],
      ];
    }
    const filterSheet = XLSX.utils.aoa_to_sheet(data);
    filterSheet['!cols'] = [ {wch: 100}];
    XLSX.utils.book_append_sheet(wb, filterSheet, 'Filter');

    // const now = moment().format('YYYY-MM-DD-HH-mm-ss');
    const now = Date().toString();
    XLSX.writeFile(wb, 'Transgenes-' + now + '.xlsx');
  }
}
