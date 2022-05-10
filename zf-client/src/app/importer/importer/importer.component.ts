import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {ZFTool} from '../../helpers/zf-tool';
import {AuthService} from '../../auth/auth.service';
import {ZFImportType} from './zf-import-type';
import * as XLSX from 'xlsx';
import {ParsingOptions, WorkBook, WorkSheet} from 'xlsx';
import {LoaderService} from '../../loader.service';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

class ImportSwitch {
  constructor(public name: ZFImportType,
              public isSelected: boolean = false,
              public description?: string) {
  }
}


/**
 * Let the user select which sheets to load from an import file.
 */

@Component({
  selector: 'app-importer',
  template: `
    <div fxLayout="row" fxLayoutAlign="center" *ngIf="authService.loggedIn$ | async">
      <div class="zf-full-width">
        <mat-toolbar color="primary">
          Importer - Never use on a live system
          <span class="fill-remaining-space"></span>
        </mat-toolbar>
      </div>
    </div>
    <mat-card>
      <mat-card-title>Select File</mat-card-title>
      <button [disabled]="!canSelectFile" mat-button color="primary" (click)="openFileChooser()">
        <label>Select upload file...</label>
      </button>
      <input id="fileToImport" type="file" hidden (change)="fileSelected($event)">
    </mat-card>

    <mat-card>
      <mat-card-title>Which sheets we upload?</mat-card-title>
      <mat-card-subtitle>Sheet names must exactly match text below</mat-card-subtitle>
      <div fxLayout="column">
        <div *ngFor="let importSwitch of importSwitches">
          <mat-checkbox [(ngModel)]="importSwitch.isSelected"
                        color="primary">
            {{importSwitch.name}}
            <span *ngIf="importSwitch.description"> ({{importSwitch.description}})</span>
          </mat-checkbox>
        </div>
      </div>
    </mat-card>

    <mat-card *ngIf="selectedFile">
      <mat-card-title>Do That Import Thing...</mat-card-title>
      <div *ngIf="selectedFile">
        <button mat-button color="primary" (click)="importWorkbook()">
          Upload {{selectedFile.name}}
        </button>
      </div>
    </mat-card>

    <mat-card *ngIf="total > 0 || notes.length > 0 || problems.length > 0">
      <mat-card-title>Progress...</mat-card-title>
      <div *ngIf="(total - done) > 0" fxLayout="row" fxLayoutAlign="space-between center">
        <div>Done: {{done}}</div>
        <div>Loading {{currentlyImporting}}</div>
        <div>Total: {{total}}</div>
      </div>
      <mat-progress-bar *ngIf="total - done > 0" [value]="progress" mode="determinate"></mat-progress-bar>
      <div *ngIf="problems.length > 0">
        <H2>Problems:</H2>
        <ul>
          <li *ngFor="let problem of problems">{{problem}}</li>
        </ul>
      </div>

      <div *ngIf="notes.length > 0">
        <H2>Notes:</H2>
        <ul>
          <li *ngFor="let note of notes">{{note}}</li>
        </ul>
      </div>
    </mat-card>
  `,

  styleUrls: ['./importer.component.scss']
})

export class ImporterComponent implements OnInit {
  importSwitches: ImportSwitch[] = [
    new ImportSwitch(ZFImportType.ZF_IMPORT_USER, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_MUTATION, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_TRANSGENE, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_TANKS, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_MUTATION_TYPES, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_SCREEN_TYPES, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_STOCK, false),
    new ImportSwitch(ZFImportType.ZF_IMPORT_LINEAGE, false, 'the "internal" parents of stocks.'),
    new ImportSwitch(ZFImportType.ZF_IMPORT_STOCK_MARKERS, false, 'mutations and transgenes for each stock'),
    new ImportSwitch(ZFImportType.ZF_IMPORT_SWIMMERS, false, 'which stocks are in which tanks'),
  ];
  selectedFile: any;
  canSelectFile = true;
  problems: string[] = [];
  notes: string[] = [];
  currentlyImporting: string;
  total: number;
  done: number;
  progress: number;

  constructor(
    public appState: AppStateService,
    public authService: AuthService,
    private service: LoaderService,
  ) {
  }

  ngOnInit(): void {
    this.appState.setActiveTool(ZFTool.IMPORT_TOOL);
  }

  /* Note to future self that cost me about three hours 2018-10-05.
   * This next bit is a work-around for the fact that angular buttons do not
   * mix well with <input type=file>, so the html has an angular button and
   * a hidden <input type=file>. When the button is pushed it calls this
   * function which programmatically clicks the file chooser which results
   * in the file chooser showing up.
   * Further note to self - if the Angular button label uses the
   * label-for="fileToUpload" attribute, then the Chrome browser is smart
   * enough to know what you are trying to do and it automatically pops up the
   * file chooser - meaning that it shows up twice.  Firefox is not so smart.
   * So do not use the label-for and both browsers work.
   */
  openFileChooser() {
    document.getElementById('fileToImport').click();
  }

  async fileSelected(event) {
    this.selectedFile = event.target.files[0];
    this.problems = [];
    this.notes = [];
    this.notes.push(`File selected: ${this.selectedFile.name}`);
    this.currentlyImporting = null;
    this.selectedFile = event.target.files[0];
  }

  async importWorkbook() {
    this.canSelectFile = false;
    const fileContent = await readFileAsArrayBuffer(this.selectedFile);
    const options: ParsingOptions = {type: 'array'};
    const importWb = XLSX.read(fileContent, options);
    if (!importWb) {
      this.problems.push(`Could not read workbook.`);
      this.canSelectFile = true;
      return;
    }

    const resultWb: WorkBook = XLSX.utils.book_new();
    const now = new Date().toISOString();

    for (const importSwitch of this.importSwitches) {
      if (importSwitch.isSelected) {
        const ws = importWb.Sheets[importSwitch.name];
        if (!ws) {
          this.problems.push(`Could not find worksheet: ${importSwitch.name}.`);
        } else {
          XLSX.utils.book_append_sheet(resultWb, await this.importSheet(importSwitch.name, ws), importSwitch.name);
        }
      }
    }

    this.canSelectFile = true;
    if (resultWb.SheetNames.length > 0) {
      XLSX.writeFile(resultWb, `ImportResults-${now}.xlsx`);
    } else {
      this.problems.push('No imports');
    }
  }

  async importSheet(name: ZFImportType, ws: WorkSheet): Promise<WorkSheet> {
    this.notes.push(`Importing ${name} worksheet...`);
    const dtos: any[] = XLSX.utils.sheet_to_json(ws);
    this.total = dtos.length;
    this.done = 0;
    let errorCount = 0;
    for (const dto of dtos) {
      const response: any = await this.service.import(name, dto)
        .pipe(
          catchError(err => {
            dto.importResult = 'Failure: ' + err.error.message;
            errorCount++;
            return of(null);
          })
        )
        .toPromise();
      if (response) {
        dto.id = response.id;
        dto.importResult = 'Success';
      }
      this.done = this.done + 1;
      this.progress = this.done / this.total * 100;
    }
    this.notes.push(`Done ${name} importing. Number imported: ${this.done}. Number Errors: ${errorCount}`);
    return XLSX.utils.json_to_sheet(dtos);
  }

}

const readFileAsArrayBuffer = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(temporaryFileReader.error);
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsArrayBuffer(inputFile);
  });
};
