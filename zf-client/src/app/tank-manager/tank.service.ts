import {Inject, Injectable} from '@angular/core';
import {LoaderService, ZFTypes} from '../loader.service';
import {MatSnackBar} from '@angular/material';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Tank} from './tank';
import {TankDto} from './tank-dto';
import {TankFilter} from './tank-filter';
import {SwimmerFullDto} from './swimmer-full-dto';
import {StockSwimmerDto} from './stock-swimmer-dto';
import {AppStateService} from '../app-state.service';

/**
 * This is the model for transgene information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class TankService extends ZFGenericService<Tank, Tank, TankFilter> {

  // This is a cache of all the known tanks.
  // Its only purpose is to help the GUI respond relatively quickly when the user
  // is typing a tank name., No round trips to the server.
  // Since tanks in a facility do not change (well, almost never), it does not have
  // to be refreshed.
  private _all$: BehaviorSubject<Tank[]> = new BehaviorSubject<Tank[]>([]);
  private indexedAll: {[key: string]: Tank};
  get all(): Tank[] { return this._all$.value; }

  constructor(
    private readonly loaderForGeneric: LoaderService,
    private snackBarForGeneric: MatSnackBar,
    private appStateServiceForGeneric: AppStateService,
  ) {
    super(Tank, Tank, TankFilter, ZFTypes.TANK, loaderForGeneric, snackBarForGeneric, appStateServiceForGeneric);

    // not used for tanks.
    this._fieldOptions = new FieldOptions({});
    this.loadAllTanks();

    this._all$.subscribe((tanks: Tank[]) => {
      this.indexedAll = {};
      for (const tank of tanks) {
        this.indexedAll[tank.name] = tank;
      }
    });
  }

  loadAllTanks() {
    this.loader.getFilteredList(ZFTypes.TANK, {}).subscribe((data: TankDto[]) => {
      this._all$.next(data.map(m => this.convertSimpleDto2Class(m)));
    });
  }

  getTankByName(putativeName: string): Tank | null {
    if (this.indexedAll[putativeName]) {
      return this.indexedAll[putativeName];
    } else {
      return null;
    }
  }

  isValidName(tankName: string): boolean {
    return !!(this.indexedAll[tankName]);
  }

  // find out which stocks are currently in a given tank.
  getSwimmers(tankName: string): Observable<SwimmerFullDto[]> {
    const tank: Tank = this.getTankByName(tankName);
    if (!tank) { return of([]); }
    return this.loader.getStocksInTank(tank.id);
  }

  addSwimmer(swimmer: StockSwimmerDto) {
    return this.loader.create(ZFTypes.SWIMMER, swimmer);
  }

  deleteSwimmer(swimmer: StockSwimmerDto) {
    return this.loader.deleteSwimmer(swimmer.stockId, swimmer.tankId);
  }

  updateSwimmer(swimmer: StockSwimmerDto) {
    return this.loader.update(ZFTypes.SWIMMER, swimmer);
  }
}