import {Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {MutationFilter} from './mutation-filter';
import {MatLegacySnackBar as MatSnackBar} from '@angular/material/legacy-snack-bar';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import * as XLSX from 'xlsx';
import {WorkSheet} from 'xlsx';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {plainToClass} from 'class-transformer';
import {ZFTypes} from '../helpers/zf-types';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {MutationDto} from './mutation-dto';
import {MutationTypeDto} from './mutation-types/mutation-type-dto';
import {ScreenTypeDto} from './screen-types/screen-type-dto';

/**
 * This is the model for mutation information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class MutationService extends ZFGenericService<MutationDto, MutationDto, MutationFilter> {

  public spermFreezeOptions = ['DONE', 'NEVER', 'TODO'];
  public mutationTypes: MutationTypeDto[] = [];
  public screenTypes: ScreenTypeDto[] = [];

  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private appState: AppStateService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(ZFTypes.MUTATION, loader, snackBar, appState, authService, router);
    this.authService.loggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.initialize();
      }
    });
  }

  // convert a plain (json) object to a FullDTO
  // I could not figure out how to do this in the generic service class
  plain2FullClass(plain): MutationDto {
    return plainToClass(MutationDto, plain);
  }

  plain2RegularClass(plain): MutationDto {
    return plainToClass(MutationDto, plain);
  }

  initialize() {
    const storedFilter = this.appState.getToolState(ZFTypes.MUTATION, ZFToolStates.FILTER);
    if (storedFilter) {
      this.setFilter(plainToClass(MutationFilter, storedFilter));
    } else {
      this.setFilter(plainToClass(MutationFilter, {}));
    }

    this.loader.getMutationTypes().subscribe((mts: MutationTypeDto[]) => this.mutationTypes = mts);
    this.loader.getScreenTypes().subscribe((mts: ScreenTypeDto[]) => this.screenTypes = mts);

    this._fieldOptions = new FieldOptions({
      name: [],
      gene: [],
      screenType: [],
      mutationType: [],
    });
    this.refresh();
  }

  nameIsInUse(name: string): boolean {
    return this._fieldOptions.options.name.includes(name);
  }

  nicknameIsInUse(nickname: string): boolean {
    if (nickname === null) {
      return false;
    }
    for (const t of this.all) {
      if (t.nickname === nickname) {
        return true;
      }
    }
    return false;
  }

  // This is used to populate an autocomplete field of mutations
  getListFilteredByString(searchString: string): MutationDto[] {
    return this.all.filter((m: MutationDto) => {
      const ss: string = searchString.toLowerCase();
      return(
        (m.gene && m.gene.toLowerCase().includes(ss)) ||
        (m.name && m.name.toLowerCase().includes(ss)) ||
        (m.nickname && m.nickname.toLowerCase().includes(ss)));
    });
  }
  getExportWorksheet(): WorkSheet {
    const mutationSheet = XLSX.utils.json_to_sheet(this.all.map((m: MutationDto) => {
      return {
        id: m.id,
        'Serial#': m.serialNumber,
        Allele: m.name,
        Nickname: m.nickname,
        Gene: m.gene,
        'Alt Gene': m.alternateGeneName,
        'ZFIN Id': m.zfinId,
        Source: m.researcher,
        Comment: m.comment,
        'Mutation Type': m.mutationType,
        ScreenType: m.screenType,
        aaChange: m.aaChange,
        actgChange: m.actgChange,
        'Sperm Freeze Plan': m.spermFreezePlan,
        'Vials Frozen': m.vialsFrozen,
        Phenotype: m.phenotype,
        'Morphant Phenotype': m.morphantPhenotype,
      };
    }));
    mutationSheet['!cols'] = [
      {wch: 4}, {wch: 8},
      {wch: 10}, {wch: 12},
      {wch: 12}, {wch: 12},
      {wch: 24}, {wch: 12},
      {wch: 50}, {wch: 12}, {wch: 12},
      {wch: 8}, {wch: 8}, {wch: 8}, {wch: 8},
      {wch: 8}, {wch: 8},
    ];
    return mutationSheet;
  }

  dataCleanlinessReport() {
    super.dataCleanlinessReport(['researcher', 'gene', 'mutationType', 'screenType'], 'MutationDataCleanliness');
  }
}
