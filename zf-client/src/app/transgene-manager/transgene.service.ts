import {Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {TransgeneFilter} from './transgene-filter';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import * as XLSX from 'xlsx';
import {WorkSheet} from 'xlsx';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {plainToClass} from 'class-transformer';
import {ZFTypes} from '../helpers/zf-types';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {TransgeneDto} from './transgene-dto';

/**
 * This is the model for transgene information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class TransgeneService extends ZFGenericService<TransgeneDto, TransgeneDto, TransgeneFilter> {

  public spermFreezeOptions = ['DONE', 'NEVER', 'TODO'];

  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private appState: AppStateService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(ZFTypes.TRANSGENE, loader, snackBar, appState, authService, router);
    this.authService.loggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.initialize();
      }
    })
  }

  initialize() {
    const storedFilter = this.appState.getToolState(ZFTypes.TRANSGENE, ZFToolStates.FILTER);
    if (storedFilter) {
      this.setFilter(plainToClass(TransgeneFilter, storedFilter));
    } else {
      this.setFilter(plainToClass(TransgeneFilter, {}));
    }

    this._fieldOptions = new FieldOptions({
      'nameValidation': [],
      'source': [],
    });
    this.refresh();
  }

  // convert a plain (json) object to a "Full" DTO
  // I could not figure out how to do this in the generic service class
  plain2FullClass(plain): TransgeneDto {
    return plainToClass(TransgeneDto, plain);
  }

  plain2RegularClass(plain): TransgeneDto {
    return plainToClass(TransgeneDto, plain);
  }


  // This is used to populate an autocomplete field of transgenes
  getListFilteredByString(searchString: string): TransgeneDto[] {
    return this.all.filter((t: TransgeneDto) => {
      const ss: string = searchString.toLowerCase();
      return (
        (t.descriptor && t.descriptor.toLowerCase().includes(ss)) ||
        (t.allele && t.allele.toLowerCase().includes(ss)) ||
        (t.nickname && t.nickname.toLowerCase().includes(ss)));
    });
  }

  // TODO - should go to the server for this
  uniquenessValidator(name: string): boolean {
    return this._fieldOptions.options.nameValidation.includes(name);
  }

  //TODO Really should go to the server for this
  nicknameIsInUse(nickname: string, exceptingId: number): boolean {
    if (nickname === null) {
      return false;
    }
    for (const t of this.all) {
      if (t.id !== exceptingId && t.nickname === nickname) {
        return true;
      }
    }
    return false;
  }

  getExportWorksheet(): WorkSheet {
    const ws = XLSX.utils.json_to_sheet(this.all.map((m: TransgeneDto) => {
      return {
        id: m.id,
        "Serial#": m.serialNumber,
        Allele: m.allele,
        Nickname: m.nickname,
        Construct: m.descriptor,
        "ZFIN Id": m.zfinId,
        Source: m.source,
        Plasmid: m.plasmid,
        'Sperm Freeze Plan': m.spermFreezePlan,
        'Vials Frozen': m.vialsFrozen,
        Comment: m.comment,
      };
    }));
    ws['!cols'] = [ {wch: 4}, {wch: 8}, {wch: 12}, {wch: 25}, {wch: 25},
      {wch: 20}, {wch: 20}, {wch: 8}, {wch: 8},
      {wch: 8}, {wch: 40}];
    return ws;
  }

  dataCleanlinessReport() {
    super.dataCleanlinessReport(['source'], 'TransgeneDataCleanliness');
  }
}
