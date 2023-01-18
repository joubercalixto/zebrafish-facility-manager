import {NgModule} from '@angular/core';
import {MutationManagerRoutingModule} from './mutation-manager-routing.module';
import {MutationManagerComponent} from './mutation-manager.component';
import {MutationSelectorComponent} from './mutation-selector/mutation-selector.component';
import {MutationEditorComponent} from './mutation-editor/mutation-editor.component';
import {MutationViewerComponent} from './mutation-viewer/mutation-viewer.component';
import {MutationMenuComponent} from './mutation-menu/mutation-menu.component';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatNativeDateModule} from '@angular/material/core';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {CommonModule} from '@angular/common';
import {AuthModule} from '../auth/auth.module';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MutationMiniViewerComponent} from './mutation-mini-viewer/mutation-mini-viewer.component';
import {MutationTinyViewerComponent} from './mutation-mini-viewer/mutation-tiny-viewer.component';
import {ZfGenericModule} from '../zf-generic/zf-generic.module';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';

@NgModule({
  declarations: [
    MutationEditorComponent,
    MutationManagerComponent,
    MutationMenuComponent,
    MutationMiniViewerComponent,
    MutationSelectorComponent,
    MutationTinyViewerComponent,
    MutationViewerComponent,
  ],
  imports: [
    MutationManagerRoutingModule,
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    AuthModule,
    MatCheckboxModule,
    MatSidenavModule,
    ZfGenericModule,
    MatProgressBarModule,
  ],
  exports: [
    MutationMenuComponent,
    MutationMiniViewerComponent,
    MutationTinyViewerComponent
  ]
})

export class MutationManagerModule {}
