import {NgModule} from '@angular/core';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatNativeDateModule} from '@angular/material/core';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {CommonModule} from '@angular/common';
import {StockMenuComponent} from './stock-menu/stock-menu.component';
import {StockManagerComponent} from './stock-manager.component';
import {StockSelectorComponent} from './stock-selector/stock-selector.component';
import {StockEditorComponent} from './stock-editor/stock-editor.component';
import {StockViewerComponent} from './stock-viewer/stock-viewer.component';
import {StockManagerRoutingModule} from './stock-manager-routing.module';
import {StockGeneticsEditorComponent} from './stock-genetics-editor/stock-genetics-editor.component';
import {StockSwimmersEditorComponent} from './stock-swimmers-editor/stock-swimmers-editor.component';
import {TankNameValidator} from './validators/tankNameValidator';
import {StockNameCheckValidator} from './validators/stockNameCheck';
import {AuthModule} from '../auth/auth.module';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {DateToAgePipe} from './date-to-age.pipe';
import {TankWalkerComponent} from './tank-walker/tank-walker.component';
import {MutationManagerModule} from '../mutation-manager/mutation-manager.module';
import {TransgeneManagerModule} from '../transgene-manager/transgene-manager.module';
import {ZfGenericModule} from '../zf-generic/zf-generic.module';
import {CrossLabelMakerComponent} from './cross-label-maker/cross-label-maker.component';
import {TankLabelMakerComponent} from './tank-label-maker/tank-label-maker.component';
import {QRCodeModule} from 'angularx-qrcode';
import {TankManagerModule} from '../tank-manager/tank-manager.module';
import {TankLabelElementComponent} from './tank-label-maker/tank-label-element/tank-label-element.component';

@NgModule({
  declarations: [
    StockEditorComponent,
    StockSelectorComponent,
    StockManagerComponent,
    StockMenuComponent,
    StockGeneticsEditorComponent,
    StockSelectorComponent,
    StockSwimmersEditorComponent,
    StockViewerComponent,
    TankWalkerComponent,
    TankNameValidator,
    StockNameCheckValidator,
    DateToAgePipe,
    CrossLabelMakerComponent,
    TankLabelMakerComponent,
    TankLabelElementComponent,
  ],
  imports: [
    StockManagerRoutingModule,
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    AuthModule,
    MatSidenavModule,
    MutationManagerModule,
    TransgeneManagerModule,
    ZfGenericModule,
    QRCodeModule,
    TankManagerModule,
  ],
  exports: [
    StockMenuComponent
  ]
})

export class StockManagerModule {}
