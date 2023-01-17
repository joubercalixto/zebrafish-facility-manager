import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ImporterRoutingModule} from './importer-routing.module';
import {ImporterComponent} from './importer/importer.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MutationManagerModule} from '../mutation-manager/mutation-manager.module';
import {MatButtonModule} from '@angular/material/button';
import {AuthModule} from '../auth/auth.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';


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
