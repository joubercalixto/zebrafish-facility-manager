import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {ZFTool} from '../helpers/zf-tool';
import {AuthApiService} from '../auth/auth-api.service';
import {AuthService} from '../auth/auth.service';
import {AppStateService} from '../app-state.service';
import {ScreenSizes} from '../helpers/screen-sizes';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})

export class TopBarComponent implements OnInit {
  zfTool = ZFTool;
  ScreenSizes = ScreenSizes;

  constructor(
    public appState: AppStateService,
    private router: Router,
    private passwordChangeDialog: MatDialog,
    private authApiService: AuthApiService,
    public authService: AuthService,
  ) {
  }

  async ngOnInit() {
  }

  goToBestPractices(): void {
    window.open(`${this.appState.facilityConfig.bestPracticesSite}/stocks`);
  }

  login() {
    this.router.navigateByUrl('/login').then();
  }

  logout() {
    if (this.authService.isAuthenticated) {
      this.authApiService.logout().subscribe(() => {
        this.authService.onLogout();
        this.router.navigateByUrl('/splash').then();
      });
    }
  }
}
