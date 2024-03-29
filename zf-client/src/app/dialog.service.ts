import {Injectable} from '@angular/core';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {CanDeactivateComponent} from './guards/can-deactivate-component';
import {lastValueFrom} from 'rxjs';

@Injectable()
export class DialogService {
  constructor(
    private dialog: MatDialog,
  ) {}

  async confirm(message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(CanDeactivateComponent, {
      data: {
        message,
      }
    });

    return lastValueFrom(dialogRef.afterClosed());
  }
}
