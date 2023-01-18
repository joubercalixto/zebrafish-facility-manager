import {Component, Inject,} from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';

@Component({
  selector: 'can-deactivate',
  templateUrl: './can-deactivate-component.html',
  styleUrls: ['./can-deactivate-component.scss']
})

export class CanDeactivateComponent {

  constructor(
    public dialogRef: MatDialogRef<CanDeactivateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string; },
    ) {}

  ignoreChanges() {
    this.dialogRef.close(true);
  }

  continueEditing() {
    this.dialogRef.close(false);
  }
}
