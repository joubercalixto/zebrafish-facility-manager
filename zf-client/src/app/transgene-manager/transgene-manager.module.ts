import {NgModule} from '@angular/core';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {CommonModule} from '@angular/common';
import {TransgeneEditorComponent} from './transgen-editor/transgene-editor.component';
import {TransgeneManagerComponent} from './transgene-manager.component';
import {TransgeneSelectorComponent} from './transgene-selector/transgene-selector.component';
import {TransgeneViewerComponent} from './transgene-viewer/transgene-viewer.component';
import {TransgeneManagerRoutingModule} from './transgene-manager-routing.module';
import {TransgeneMenuComponent} from './transgene-menu/transgene-menu.component';
import {AuthModule} from '../auth/auth.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {TransgeneMiniViewerComponent} from './transgene-mini-viewer/transgene-mini-viewer.component';
import {TransgeneTinyViewerComponent} from './transgene-mini-viewer/transgene-tiny-viewer.component';
import {ZfGenericModule} from '../zf-generic/zf-generic.module';

@NgModule({
  declarations: [
    TransgeneEditorComponent,
    TransgeneManagerComponent,
    TransgeneMenuComponent,
    TransgeneSelectorComponent,
    TransgeneViewerComponent,
    TransgeneMiniViewerComponent,
    TransgeneTinyViewerComponent,
  ],
  imports: [
    TransgeneManagerRoutingModule,
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    AuthModule,
    MatSidenavModule,
    ZfGenericModule,
  ],
  exports: [
    TransgeneMenuComponent,
    TransgeneMiniViewerComponent,
    TransgeneTinyViewerComponent

  ]
})

export class TransgeneManagerModule {}
