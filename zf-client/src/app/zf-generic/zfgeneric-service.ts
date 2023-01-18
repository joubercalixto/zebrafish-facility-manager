import {Injectable} from '@angular/core';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import {BehaviorSubject, interval, Observable} from 'rxjs';
import {LoaderService} from '../loader.service';
import {FieldOptions} from '../helpers/field-options';
import {ZfGenericFilter} from './zfgeneric-filter';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {ZFTypes} from '../helpers/zf-types';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {ZfGenericDto} from './zfgeneric-dto';
import * as XLSX from 'xlsx';

/**
 * There is a service for every different type of object in the system.
 * Stock, or Transgene or Mutation and there could be more later.
 *
 * All the services are slight variations on a theme. This generic service is the theme.
 *
 * A given extension of the generic service models information displayed in the
 * GUI for one type of object.
 *
 * The data in the model is maintained through communication with the server.
 * The "state" includes -
 * - the currently selected item
 * - a filter object that determines which of the items are in the filtered list
 * - the filtered list itself
 * - array of known values for each of several fields (to facilitate auto-completion)
 *
 * The service provides a mechanism for converting received DTOs to actual objects.
 *
 * This service is also provides support for CRUD operations for GUI clients.
 * An important note is that after certain operations (like creating an object),
 * the other stuff (like the known values for autocomplete options) may also change.
 * So this service is responsible for keeping all of that information in sync.
 *
 * There will be variants for each type of object, but at least we do not triplicate
 * this code (anymore).
 */

@Injectable()
export class ZFGenericService<// The SIMPLE_OBJ is a simple version of an object (Transgene, Mutation, Stock)
  // It is SIMPLE because it does not contain related objects.  So, it is used
  // for things like the filteredList.
  SIMPLE_OBJ extends ZfGenericDto,
  // The FULL_OBJ is the full version including some related objects.
  // It is FULL because it *does* (or can) contain related objects.  So, it is used
  // for things like the selectedObject.
  FULL_OBJ extends ZfGenericDto,
  // Note to future self: for Transgenes and Mutations the simple and full classes
  // are the same. For Stocks, they are not even close.

  // The FILTER is a class that specializes in filtering one of the above classes.
  FILTER extends ZfGenericFilter> {

  // Some extensions like transgeneService and mutationService will cache all instances and
  protected _filteredList: SIMPLE_OBJ[] = [];

  // Flag indicating that the service is meant to cache all instances of this type.
  private readonly cacheAll: boolean;

  // make them available.
  protected _all: SIMPLE_OBJ[] = [];

  // This is the currently selected item.
  // It is in focus as far as the GUI is concerned.
  protected _selected$: BehaviorSubject<FULL_OBJ> = new BehaviorSubject<FULL_OBJ>(null);
  get selected$(): BehaviorSubject<FULL_OBJ> {
    return this._selected$;
  }

  get selected(): FULL_OBJ {
    return this.selected$.value;
  }

  private _filter: FILTER;
  get filter(): FILTER {
    return this._filter;
  }

  get all(): SIMPLE_OBJ[] {
    return this._all;
  }

  get filteredList(): SIMPLE_OBJ[] {
    return this._filteredList;
  }

  // The ZF objects usually have a name that is assigned by the system. The
  // name is sequential and the user does not get to choose it, again usually.
  // So we keep track of what the next designated name for the next object.
  // The next name is only "likely" because some other GUI client may grab it
  // first.
  private _likelyNextName$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  get likelyNextName$(): BehaviorSubject<string> {
    return this._likelyNextName$;
  }

  get likelyNextName(): string {
    return this.likelyNextName$.value;
  }

  protected _fieldOptions: FieldOptions;
  get fieldOptions(): FieldOptions {
    return this._fieldOptions;
  }

  // This keeps track of whether the user is editing or browsing
  public inEditMode = false;

  constructor(
    // this is used to tell the loaderService what type to use in server calls.
    private zfType: ZFTypes, // stock, mutation or transgene.

    // The loaderService is used in all instances of the generic service
    // but, I cannot figure out how to inject it into the generic service.
    // So, instead every instance does the injection and passes it to
    // the generic service in its super call.
    protected readonly loaderService: LoaderService,
    // The snackbar is used to give quick progress messages and like the
    // loaderService, I cannot figure out how to inject one in this generic class.
    protected messageService: MatSnackBar,
    private appStateService: AppStateService,
    private authorizationService: AuthService,
    private routerService: Router,
  ) {
    // problem: I want to pass to the constructor a flag indicating whether the
    // service is meant to cache the full list of instances of this zfType.
    // However, if I use: private cacheAll: boolean = false, of course angular tries
    // to inject cacheAll, which it cannot do. at least I know for now that only
    // transgenes and mutations want to cache all, so...
    // TODO Remove this kludge
    this.cacheAll = (this.zfType === ZFTypes.TRANSGENE || this.zfType === ZFTypes.MUTATION);

    // auto-refresh the service's data every so often
    const source: Observable<any> = interval(appStateService.backgroundDataRefreshInterval);
    source.subscribe(_ => this.refresh());
  }

  // these two methods have to be overridden by service classes
  plain2FullClass(plain): FULL_OBJ {
    return plain;
  }

  plain2RegularClass(plain): SIMPLE_OBJ {
    return plain;
  }

  // load the set of currently known values for some fields

  // These are used primarily for auto-complete fields in the GUI
  loadFieldOptions() {
    this.loaderService.getFieldOptions(this.zfType).subscribe((data: { [key: string]: string[] }) => {
      this._fieldOptions.fillFromPlain(data);
    });
  }

  // the selection operation by id.
  // A bad id leaves us with nothing selected.
  setSelectedId(id: number) {
    if (id) {
      this.appStateService.setToolState(this.zfType, ZFToolStates.SELECTED_ID, id);
    } else {
      this.appStateService.removeToolState(this.zfType, ZFToolStates.SELECTED_ID);
    }
  }

  getSelectedId(): number | null {
    return this.appStateService.getToolState(this.zfType, ZFToolStates.SELECTED_ID);
  }

  loadSelected() {
    const id = this.getSelectedId();
    if (id) {
      this.getById(id).subscribe((item: FULL_OBJ) => {
        if (item) {
          this.selected$.next(this.plain2FullClass(item));
        } else {
          this.appStateService.removeToolState(this.zfType, ZFToolStates.SELECTED_ID);
          this.selected$.next(null);
        }
      });
    } else {
      this.appStateService.removeToolState(this.zfType, ZFToolStates.SELECTED_ID);
      this.selected$.next(null);
    }
  }

  selectByIdAndLoad(id: number) {
    this.setSelectedId(id);
    this.loadSelected();
  }

// fetch an instance from the server.
  getById(id: number): Observable<FULL_OBJ> {
    return this.loaderService.getInstance(this.zfType, id);
  }

  setFilter(filter: FILTER) {
    this._filter = filter;
  }

  applyFilter() {
    this.appStateService.setToolState(this.zfType, ZFToolStates.FILTER, this.filter);
    this.loaderService.getFilteredList(this.zfType, this.filter)
      .subscribe((dtoList: any[]) => {
        this._filteredList = dtoList.map(dto => this.plain2RegularClass(dto));
        // If there is no object selected when this list comes back, go ahead and select
        // the first item of the filtered list.
        if (!this.getSelectedId() && this.filteredList.length > 0) {
          this.selectByIdAndLoad(this.filteredList[0].id);
        }
      });
  }

  loadAll() {
    this.loaderService.getFilteredList(this.zfType, {})
      .subscribe((dtoList: any[]) => {
        this._all = dtoList.map(dto => this.plain2RegularClass(dto));
      });
  }


  getLikelyNextName() {
    this.loaderService.getLikelyNextName(this.zfType).subscribe(data => {
      if (data['name'] !== this.likelyNextName) {
        this.likelyNextName$.next(data['name']);
      }
    });
  }

  update(item: FULL_OBJ) {
    this.loaderService.update(this.zfType, item).subscribe((result) => {
      if (result.id) {
        this.messageService.open(this.zfType + ' updated.', null, {duration: this.appStateService.confirmMessageDuration});
        this.setSelectedId(result.id);
        this.refresh();
        this.routerService.navigateByUrl(this.appStateService.activeTool.route + '/view/' + result.id).then();
      }
    });
  }

  create(item: FULL_OBJ) {
    this.loaderService.create(this.zfType, item).subscribe((result) => {
      if (result.id) {
        this.messageService.open(this.zfType + ' created.', null, {duration: this.appStateService.confirmMessageDuration});
        this.setSelectedId(result.id);
        this.refresh();
        this.routerService.navigateByUrl(this.appStateService.activeTool.route + '/view/' + result.id).then();
      }
    });
  }

  // just like create except it tells the server to use the server assigned name
  // and not some user chosen name
  createNext(item: FULL_OBJ) {
    this.loaderService.createNext(this.zfType, item).subscribe((result) => {
      if (result.id) {
        this.messageService.open(this.zfType + ' created.', null, {duration: this.appStateService.confirmMessageDuration});
        this.setSelectedId(item.id);
        this.refresh();
        this.routerService.navigateByUrl(this.appStateService.activeTool.route + '/view/' + result.id).then();
      }
    });
  }

  delete(id: number) {
    this.loaderService.delete(this.zfType, id).subscribe((result) => {
      if (result) {
        this.messageService.open(this.zfType + ' deleted.', null, {duration: this.appStateService.confirmMessageDuration});
        this.setSelectedId(0);
        this.selected$.next(null);
        this.refresh();
        // TODO the refresh may not be done by the time the viewer tries to select
        this.routerService.navigateByUrl(this.appStateService.activeTool.route + '/view').then();
      }
    });
  }

  // load up all the cache info this service needs.  This is done
  // a) when a client of this service changes something that invalidates the cache such as:
  //    i) an item changes, so it now does or does not match the filter,
  //    ii) an item is added
  //    iii) and item is deleted
  // b) periodic reload of the cache.
  refresh() {
    if (this.authorizationService.isAuthenticated) {
      if (this.cacheAll) {
        this.loadAll();
      }
      this.loadFieldOptions();
      this.getLikelyNextName();
      this.applyFilter(); // apply the filter to reload the filtered list.
    }
  }

  // Badly named.  These *really* mean -
  // true: tuck away the selector
  // false: show the selector.
  enterEditMode() {
    this.inEditMode = true;
  }

  enterBrowseMode() {
    this.inEditMode = false;
  }

  dataCleanlinessReport(fieldList: string[], title) {
    const wb = XLSX.utils.book_new();
    for (const fieldName of fieldList) {
      const data: string[][] = [[fieldName, 'Change To']];
      this._fieldOptions.options[fieldName].map((item: string) => data.push([item]));
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = [{wch: 25}, {wch: 25}];
      XLSX.utils.book_append_sheet(wb, ws, fieldName);
    }

    const now = new Date().toISOString();
    XLSX.writeFile(wb, title + now + '.xlsx');
  }

}
