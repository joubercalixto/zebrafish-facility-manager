import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginContainerComponent} from './login/login-container.component';
import {LoginComponent} from './login/login.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {PasswordResetComponent} from './password-reset/password-reset.component';
import {PasswordChangeContainerComponent} from './password-change/password-change-container.component';
import {PasswordChangeComponent} from './password-change/password-change.component';


@NgModule({
  declarations: [
    LoginContainerComponent,
    LoginComponent,
    PasswordChangeContainerComponent,
    PasswordChangeComponent,
    PasswordResetComponent,
  ],
  exports: [
    LoginContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class LoginModule { }
