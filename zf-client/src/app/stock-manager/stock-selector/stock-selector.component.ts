import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {StockService} from '../stock.service';
import {StockFilter} from './stock-filter';
import {Router} from '@angular/router';
import {StockDto} from '../dto/stock-dto';
import {AppStateService, ZFToolStates} from '../../app-state.service';
import {MutationService} from '../../mutation-manager/mutation.service';
import {MutationDto} from '../../mutation-manager/mutation-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {TransgeneService} from '../../transgene-manager/transgene.service';
import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';
import {ZFTypes} from '../../helpers/zf-types';
import {UserDTO} from '../../auth/UserDTO';
import {AuthApiService} from '../../auth/auth-api.service';
import {ZFTool} from '../../helpers/zf-tool';
import {lastValueFrom} from 'rxjs';

/**
 * A two-part component: a filter for stocks and a list of filtered stocks.
 * This is primarily a GUI component, the filter and the filtered list
 * are maintained in the stock service.
 *
 * Why?
 * 1) Because other aspects of the stock GUI may wish to change the filter
 * 2) Because this is not the only way in which a stock can become selected.
 */

@Component({
  selector: 'app-stock-selector',
  templateUrl: './stock-selector.component.html',
  styleUrls: ['./stock-selector.component.scss']
})
export class StockSelectorComponent implements OnInit {
  @Output() selected = new EventEmitter<StockDto>();

  // Build the filter form.
  mfForm = this.fb.group(this.service.filter);

  // The mutation and transgene parts of the filter form are not simply
  // strings.  They are autocomplete lists of mutations and filters, so
  // we add a couple of form controls for them.
  mutationFilterFC: FormControl = new FormControl();
  transgeneFilterFC: FormControl = new FormControl();

  // a list of mutations that updates as the user types in the mutation filter area.
  filteredMutationOptions: MutationDto[];
  filteredTransgeneOptions: TransgeneDto[];

  // List of researchers and primary investigators who currently appear in stocks.
  // The user can specify a researcher or pi in the filter.
  researchers: UserDTO[];
  pis: UserDTO[];

  constructor(
    public appState: AppStateService,
    private authApiService: AuthApiService,
    private router: Router,
    private fb: FormBuilder,
    public service: StockService,
    private mutationService: MutationService,
    private transgeneService: TransgeneService,
  ) {
  }

  async ngOnInit() {

    const storedFilter: StockFilter = this.appState.getToolState(ZFTypes.STOCK, ZFToolStates.FILTER);
    if (storedFilter && storedFilter.mutation) {
      this.mutationFilterFC.setValue(storedFilter.mutation);
    } else if (storedFilter && storedFilter.mutationId) {
      const m = await lastValueFrom(this.mutationService.getById(storedFilter.mutationId));
      this.mutationFilterFC.setValue(m);
    }
    if (storedFilter && storedFilter.transgene) {
      this.transgeneFilterFC.setValue(storedFilter.transgene);
    } else if (storedFilter && storedFilter.transgeneId) {
      this.transgeneFilterFC.setValue(await lastValueFrom(this.transgeneService.getById(storedFilter.transgeneId)));
    }
    // any time a filter value changes, reapply it
    this.mfForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.getFilteredStocks();
      });

    // the mutation filter can be a specific MutationDto or a string.
    this.mutationFilterFC.valueChanges.pipe(
      debounceTime(300)).subscribe((value: string | MutationDto) => {
      if (typeof (value) === 'string') {
        // if the filter is a string get a list of mutations that match the string
        // to be used as auto-complete options for the mutation filter.
        this.filteredMutationOptions = this.mutationService.getListFilteredByString(value);
      }
      this.getFilteredStocks();
      }
    );

    // the transgene filter can be a specific TransgeneDTO or a string.
    this.transgeneFilterFC.valueChanges.pipe(
      debounceTime(300)).subscribe((value: string | TransgeneDto) => {
        if (typeof(value) === 'string') {
          // if the filter is a string get a list of transgenes that match the string
          // to be used as auto-complete options for the transgene filter.
          this.filteredTransgeneOptions = this.transgeneService.getListFilteredByString(value);
        }
        this.getFilteredStocks();
      }
    );

    this.authApiService.getUsersByType('EXTANT_PRIMARY_INVESTIGATOR')
      .subscribe((data: UserDTO[]) => {
        this.pis = data;
      });

    this.authApiService.getUsersByType('EXTANT_RESEARCHER')
      .subscribe((data: UserDTO[]) => {
        this.researchers = data;
      });

  }

  getFilteredStocks() {
    const stockFilter: StockFilter = new StockFilter(this.mfForm.value);
    if (this.mutationFilterFC.value) {
      if (typeof (this.mutationFilterFC.value) === 'string') {
        stockFilter.mutation = this.mutationFilterFC.value;
        stockFilter.mutationId = null;
      } else {
        stockFilter.mutationId = this.mutationFilterFC.value.id;
        stockFilter.mutation = null;
      }
    } else {
      stockFilter.mutationId = null;
      stockFilter.mutation = null;
    }
    if (this.transgeneFilterFC.value) {
      if (typeof (this.transgeneFilterFC.value) === 'string') {
        stockFilter.transgene = this.transgeneFilterFC.value;
        stockFilter.transgeneId = null;
      } else {
        stockFilter.transgeneId = this.transgeneFilterFC.value.id;
        stockFilter.transgene = null;
      }
    } else {
      stockFilter.transgeneId = null;
      stockFilter.transgene = null;
    }
    this.service.setFilter(stockFilter);
    this.service.applyFilter();
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(controlName: string) {
    this.getFC(controlName).setValue(''); // which will cause the filter to reapply.
  }

  clearMutationFilter() {
    this.mutationFilterFC.setValue('');
  }

  clearTransgeneFilter() {
    this.transgeneFilterFC.setValue('');
  }

  // when clearing everything, you don't want to simply set the value
  // to an empty string because that will trigger additional filter
  // reapplications.  That's what the emitEvent: false is all about.
  onClearFilters() {
    this.mutationFilterFC.reset(null, {emitEvent: false});
    this.transgeneFilterFC.reset(null, {emitEvent: false});
    this.mfForm.reset(); // which will cause the filter to reapply.
  }

  // when the user clicks on a transgene,
  // a) emit an event.  Right now the only consumer of this event is the containing sidenav.
  //    If the selector is toggled open (as opposed to being fixed in place), it needs to
  //    toggle itself closed before
  // b) navigate to view the selected transgene
  onSelect(instance: ZfGenericDto | null) {
    this.selected.emit(instance as StockDto);
    this.router.navigate([ZFTool.STOCK_MANAGER.route + '/view/' + instance.id]).then();
  }
}

