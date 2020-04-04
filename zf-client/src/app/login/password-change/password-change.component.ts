import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {LoaderService} from "../../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CONFIRM_MESSAGE_DURATION} from "../../constants";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {UserPasswordChangeDTO} from "../../common/user/UserDTO";
import {AppStateService} from "../../app-state.service";

@Component({
  selector: 'app-password-change',
  template: `
    <section class="mat-typography">
      <div mat-dialog-title>Password Change</div>
      <form [formGroup]="mfForm" (ngSubmit)="onSubmit()">
        <div fxLayout="column" mat-dialog-content>
          <mat-form-field>
            <input type="text" matInput placeholder="Current Password" formControlName="currentPassword" >
          </mat-form-field>
          <mat-form-field>
            <input type="text" matInput placeholder="New Password" formControlName="newPassword" >
            <mat-error *ngIf="mfForm.get('newPassword').invalid"></mat-error>
          </mat-form-field>
          <mat-form-field>
            <input type="text" matInput placeholder="Repeat New Password" formControlName="repeatNewPassword" >
            <mat-error *ngIf="mfForm.get('repeatNewPassword').invalid"></mat-error>
          </mat-form-field>
      </div>
      <div mat-dialog-actions fxLayout="row">
        <div class="fill-remaining-space"></div>
        <button [disabled]="mfForm.invalid" mat-button (click)="onSubmit()" color="primary">Submit</button>
      </div>
      </form>
    </section>
  `,
})

export class PasswordChangeComponent implements OnInit {

  mfForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
    repeatNewPassword: ['', [Validators.required]],
  }, {validators: repeatPasswordValidator});

  constructor(
    public dialogRef: MatDialogRef<PasswordChangeComponent>,
    private loaderService: LoaderService,
    private message: MatSnackBar,
    private fb: FormBuilder,
    private appState: AppStateService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const dto: UserPasswordChangeDTO = this.mfForm.getRawValue();
    this.loaderService.passwordChange(dto).subscribe( (token: any) => {
      if (token) {
        this.dialogRef.close();
        this.appState.onLogin(token.accessToken);
        this.message.open(
          "Your password has been changed.",
          null, {duration: CONFIRM_MESSAGE_DURATION});
      }
    });
  }
}

const repeatPasswordValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const np = control.get('newPassword');
  const rp = control.get('repeatNewPassword');
  if (np && rp && np.value && np.value === rp.value) {
    np.setErrors(null);
    rp.setErrors(null);
    return null;
  } else {
    np.setErrors({'mismatch': true});
    rp.setErrors({'mismatch': true});
    return { 'mismatch': true};
  };
}

