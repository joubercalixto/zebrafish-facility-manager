import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  isPrinting = false;

  constructor(
    private router: Router,
  ) { }

  printDocument(documentName: string) {
    this.isPrinting = true;
    this.router.navigate(['/',
      {
        outlets: {
          print: ['print', documentName]
        }
      }]).then();
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      this.router.navigate([{outlets: {print: null}}]).then();
    });
  }
}
