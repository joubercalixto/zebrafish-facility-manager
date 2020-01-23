import {Injectable} from '@angular/core';
import {LoaderService, ZFTypes} from '../loader.service';
import {MatSnackBar} from '@angular/material';
import {StockFilter} from './stock-selector/stock-filter';
import {FieldOptions} from '../helpers/field-options';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import {map} from 'rxjs/operators';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import {StockFull} from './stockFull';
import {Observable} from 'rxjs';
import {Stock} from './stock';
import {MutationService} from '../mutation-manager/mutation.service';
import {Mutation} from '../mutation-manager/mutation';
import {TransgeneService} from '../transgene-manager/transgene.service';
import {Transgene} from '../transgene-manager/transgene';
import {CONFIRM_MESSAGE_DURATION} from '../constants';
import {AppStateService} from '../app-state.service';

/**
 * This is the model for stock information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 *
 * However, stocks have many relationships the mutations and transgenes
 * do not, so it has significantly more extensions than the other
 * classes and services.
 */


@Injectable({
  providedIn: 'root'
})
export class StockService extends ZFGenericService<
  Stock, StockFull, StockFilter> {

  constructor(
    private readonly loaderForGeneric: LoaderService,
    private snackBarForGeneric: MatSnackBar,
    private mutationService: MutationService,
    private transgeneService: TransgeneService,
    private appStateServiceForGeneric: AppStateService,
  ) {
    super(Stock, StockFull, StockFilter, ZFTypes.STOCK, loaderForGeneric, snackBarForGeneric, appStateServiceForGeneric);
    this._fieldOptions = new FieldOptions({
      'researcher': [],
    });

    // Note: normally a stock is selected and received from the server. By default the
    // received simple object is converted to a StockFull object.  However, plainToClass
    // does not seem to auto convert the arrays of mutations and transgenes DTOs in the
    // stock dto to arrays of Mutations and Transgenes. So we do that here. Ditto for parents.
    this.selected$.subscribe((s: StockFull) => {
      if (s) {
        if (s.mutations) {
          s.mutations = s.mutations.map(m => this.mutationService.convertSimpleDto2Class(m));
        }
        if (s.transgenes) {
          s.transgenes = s.transgenes.map(m => this.transgeneService.convertSimpleDto2Class(m));
        }
        if (s.offspring) {
          s.offspring = s.offspring.map(m => this.convertSimpleDto2Class(m));
        }
        if (s.matStock) {
          s.matStock = this.convertSimpleDto2Class(s.matStock);
          if (s.matStock.mutations) {
            s.matStock.mutations = s.matStock.mutations.map(m => this.mutationService.convertSimpleDto2Class(m));
          }
          if (s.matStock.transgenes) {
            s.matStock.transgenes = s.matStock.transgenes.map(m => this.transgeneService.convertSimpleDto2Class(m));
          }
        }
        if (s.patStock) {
          s.patStock = this.convertSimpleDto2Class(s.patStock);
          if (s.patStock.mutations) {
            s.patStock.mutations = s.patStock.mutations.map(m => this.mutationService.convertSimpleDto2Class(m));
          }
          if (s.patStock.transgenes) {
            s.patStock.transgenes = s.patStock.transgenes.map(m => this.transgeneService.convertSimpleDto2Class(m));
          }
        }
      }
    });
    this.refresh();
  }

  createSubStock(item: StockFull) {
    this.loader.createSubStock(item).subscribe((result: StockFull) => {
      if (result.id) {
        const r = this.convertFullDto2Class(result as StockFull);
        this.message.open(r.name + ' created.', null, {duration: CONFIRM_MESSAGE_DURATION});
        // It might seem right just to select the object you get back from the create call
        // rather than make another round trip to re-fetch the object from the server.
        // BUT the object you get back from the creation call is not reliable.  For
        // example, the "is Deletable" flag is not in the value returned here.
        this.selectById(r.id);
        this.refresh();
      }
    });
  }

  // refresh() {
  //   super.refresh();
  //   this.setFilter(this.filter); // reapply the filter to reload the filtered list.
  // }

  getByName(stockName: string): Observable<Stock> {
    return this.loader.getByName(ZFTypes.STOCK, stockName).pipe(
      map(s => (s))
    );
  }

  // in the generic service the likelyNextName is a string.  But for stocks
  // the string will actually be a number.  So...
  get likelyNextStockNumber(): number {
    return Number(this.likelyNextName);
  }

  // To make the excel report happen, you gotta go get all stocks that meet the current filter
  getStockReport() {
    this.loader.getReport(ZFTypes.STOCK, this.filter)
      .subscribe((data) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        // Set the column widths - we just happen to know the columns (for now) are
        // Stock Description DOB Researcher Mother Father Mutations Transgenes Tanks
        ws['!cols'] = [ {wch: 8}, {wch: 30}, {wch: 20}, {wch: 9},
          {wch: 9}, {wch: 10}, {wch: 20}, {wch: 30}, {wch: 30}];
        XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
        const now = moment().format('YYYY-MM-DD-HH-mm-ss');
        const ws2 = XLSX.utils.json_to_sheet([this.filter]);
        XLSX.utils.book_append_sheet(wb, ws2, 'Filter');
        XLSX.writeFile(wb, 'Stocks-' + now + '.xlsx');
      });
  }

  getAuditReport() {
    this.loader.getAuditReport()
      .subscribe((data) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        // Set the column widths - we just happen to know the columns (for now) are
        // TankName Rack Shelf Spigot Stock Count Comment
        ws['!cols'] = [ {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7},
          {wch: 7}, {wch: 7}, {wch: 40}];
        XLSX.utils.book_append_sheet(wb, ws, 'Stock Audit');
        const now = moment().format('YYYY-MM-DD-HH-mm-ss');
        XLSX.writeFile(wb, 'Facility  Audit ' + now + '.xlsx');
      });

  }

  getParentalMutations(): Mutation[] {
    let r: Mutation[] = [];
    if (this.selected.matStock && this.selected.matStock.mutations) {
      r = this.selected.matStock.mutations;
    }
    if (this.selected.patStock && this.selected.patStock.mutations) {
      r = r.concat(this.selected.patStock.mutations);
    }
    return r;
  }

  getParentalTransgenes(): Transgene[] {
    let r: Transgene[] = [];
    if (this.selected.matStock && this.selected.matStock.transgenes) {
      r = this.selected.matStock.transgenes;
    }
    if (this.selected.patStock && this.selected.patStock.transgenes) {
      r = r.concat(this.selected.patStock.transgenes);
    }
    return r;
  }
}