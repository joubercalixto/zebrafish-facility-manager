import {Injectable} from '@angular/core';
import {UserDTO} from '../UserDTO';
import {BehaviorSubject, lastValueFrom, Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppStateService, ZFToolStates} from '../../app-state.service';
import {AuthApiService} from '../auth-api.service';
import {Router} from '@angular/router';
import {UserFilter} from './user-filter';
import {ZFTypes} from '../../helpers/zf-types';
import {plainToClass} from 'class-transformer';
import {ZFTool} from '../../helpers/zf-tool';
import * as XLSX from 'xlsx';
import {WorkSheet} from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  filter: UserFilter;
  public selected$: BehaviorSubject<UserDTO> = new BehaviorSubject<UserDTO>(null);
  get selected() { return this.selected$.getValue(); }

  // This keeps track of whether the user is editing or browsing
  public inEditMode = false;

  filteredList: UserDTO[] = [];

  constructor(
    private authApiService: AuthApiService,
    private message: MatSnackBar,
    private appState: AppStateService,
    private router: Router,
  ) {
  }

  initialize() {
    const storedFilter: UserFilter = this.appState.getToolState(ZFTypes.USER, ZFToolStates.FILTER);
    if (storedFilter) {
      this.filter = plainToClass(UserFilter, storedFilter);
    } else {
      this.filter = plainToClass(UserFilter, {});
    }
  }

  applyFilter(filter: UserFilter) {
    this.filter = filter;
    this.appState.setToolState(ZFTypes.USER, ZFToolStates.FILTER, this.filter);
    this.authApiService.getUsers(filter)
      .subscribe((data: UserDTO[]) => {
        if (data) {
          this.filteredList = data;
          if (!this.selected && this.filteredList.length > 0) {
            this.select(this.filteredList[0]);
          }
        }
      });
  }

  select(user: UserDTO) {
    this.selected$.next(user);
  }

  selectById(id: string) {
    if (id) {
      this.authApiService.getInstance(id).subscribe((user: UserDTO) => {
        if (user) {
          this.select(user);
        } else {
          this.select(null);
        }
      });
    }
  }

  getById(id: string): Observable<UserDTO> {
    return this.authApiService.getInstance(id);
  }

  create(u: UserDTO) {
    this.authApiService.create(u)
      .subscribe((user: UserDTO) => {
        this.refilterAndNavigate(user);
      });
  }

  delete(id: string) {
    this.authApiService.delete(id).subscribe((result) => {
      if (result) {
        this.message.open(result.name + ' deleted.', null, {duration: this.appState.confirmMessageDuration});
        this.refilterAndNavigate(null);
      }
    });
  }

  update(u: UserDTO) {
    this.authApiService.update(u)
      .subscribe((user: UserDTO) => {
        this.refilterAndNavigate(user);
      });
  }

  activate(u: UserDTO) {
    this.authApiService.activate(u)
      .subscribe((user: UserDTO) => {
        this.refilterAndNavigate(user);
      });
  }

  deactivate(u: UserDTO) {
    this.authApiService.deactivate(u)
      .subscribe((user: UserDTO) => {
        this.refilterAndNavigate(user);
      });
  }

  forceLogout(u: UserDTO) {
    this.authApiService.forceLogout(u)
      .subscribe((user: UserDTO) => {
        this.refilterAndNavigate(user);
      });
  }

  refilterAndNavigate(user?: UserDTO) {
    // In case any of the changes drop or add the user from or to the filtered set.
    if (user) {
      this.selectById(user.id);
    } else {
      this.select(null);
    }
    this.applyFilter(this.filter);
    this.router.navigateByUrl(ZFTool.USER_MANAGER.route + '/view' + ((user) ? '/' + user.id : '')).then();
  }

  isEmailInUse(email: string): Observable<boolean> {
    return this.authApiService.isEmailInUse(email);
  }

  isUsernameInUse(email: string): Observable<boolean> {
    return this.authApiService.isUsernameInUse(email);
  }

  isNameInUse(email: string): Observable<boolean> {
    return this.authApiService.isNameInUse(email);
  }

  isInitialsInUse(email: string): Observable<boolean> {
    return this.authApiService.isInitialsInUse(email);
  }

  enterEditMode() {
    this.inEditMode = true;
  }
  enterBrowseMode() {
    this.inEditMode = false;
  }

  async getExportWorkSheet(): Promise<WorkSheet> {
    const users = await lastValueFrom(this.authApiService.getUsers(new UserFilter({})));
    const ws = XLSX.utils.json_to_sheet(users.map((u: UserDTO) => {
      return {
        Username: u.username,
        Email: u.email,
        Name: u.name,
        Initials: u.initials,
        Role: u.role,
        'Is Active': u.isActive,
        'Is Researcher': u.isResearcher,
        'Is PI': u.isPrimaryInvestigator,
        'Internal Id': u.id,
      };
    }));
    ws['!cols'] = [
      {wch: 12}, {wch: 24}, {wch: 24}, {wch: 8}, {wch: 8},
      {wch: 14}, {wch: 14}, {wch: 14}, {wch: 50},
    ];
    return ws;
  }
}
