import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserMenuComponent} from './user-menu/user-menu.component';
import {UserSelectorComponent} from './user-selector/user-selector.component';
import {UserViewerComponent} from './user-viewer/user-viewer.component';
import {UserEditorComponent} from './user-editor/user-editor.component';
import {UserAdminComponent} from './user-admin.component';
import {UserAdminRoutingModule} from './user-admin-routing.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatNativeDateModule} from '@angular/material/core';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
  declarations: [
    UserAdminComponent,
    UserMenuComponent,
    UserSelectorComponent,
    UserViewerComponent,
    UserEditorComponent,
  ],
  imports: [
    UserAdminRoutingModule,
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
  ],
  exports: [
    UserMenuComponent,
  ]

})
export class UserAdminModule { }
