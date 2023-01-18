import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SwimmerEditorComponent} from './swimmer-editor/swimmer-editor.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';


@NgModule({
  declarations: [SwimmerEditorComponent],
  exports: [
    SwimmerEditorComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class FacilityAuditModule { }
