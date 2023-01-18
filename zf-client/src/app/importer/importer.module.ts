import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ImporterRoutingModule} from './importer-routing.module';
import {ImporterComponent} from './importer/importer.component';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatIconModule} from '@angular/material/icon';
import {MutationManagerModule} from '../mutation-manager/mutation-manager.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {AuthModule} from '../auth/auth.module';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {FormsModule} from '@angular/forms';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';


@NgModule({
  declarations: [
    ImporterComponent,
  ],
  imports: [
    CommonModule,
    ImporterRoutingModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MutationManagerModule,
    MatButtonModule,
    FormsModule,
    AuthModule,
    MatCheckboxModule,
    MatCardModule,
  ]
})
export class ImporterModule { }
