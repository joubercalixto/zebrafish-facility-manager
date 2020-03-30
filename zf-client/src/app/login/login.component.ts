import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoaderService } from '../loader.service';
import { AppStateService } from '../app-state.service';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'zfm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string = null;
  password: string = null;

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private loaderService: LoaderService,
    private appStateService: AppStateService,
    private route: ActivatedRoute,
  ) {
    console.log('route at login: ' + route.toString());
  }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log({username: this.username, password: this.password});

    this.loaderService.login(this.username, this.password).subscribe( (token: any) => {
      if (token) {
        this.appStateService.onLogin(token.access_token);
        this.dialogRef.close();
      } else {
        this.appStateService.onLoginFailed();
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
