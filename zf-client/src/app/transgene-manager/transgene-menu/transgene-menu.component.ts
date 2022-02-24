import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {TransgeneService} from '../transgene.service';
import {ZFTool} from '../../helpers/zf-tool';
import {AppStateService} from '../../app-state.service';

@Component({
  selector: 'app-transgene-menu',
  templateUrl: './transgene-menu.component.html',
  styleUrls: ['./transgene-menu.component.scss']
})

export class TransgeneMenuComponent implements OnInit {

  constructor(
    public appState: AppStateService,
    private router: Router,
    public service: TransgeneService,
  ) {
  }

  ngOnInit() {
  }

  create() {
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  createNext() {
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  edit() {
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

  delete() {
    this.service.delete(this.service.selected.id);
  }

  goToBestPractices(): void {
    window.open('https://zebrafishfacilitymanager.com/best-practices/mutations');
  }
}


