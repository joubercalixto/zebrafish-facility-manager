import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrintableTankLabelComponent} from './printing/printable-tank-label/printable-tank-label.component';
import {SplashComponent} from './splash/splash.component';
import {CrossLabelComponent} from './printing/cross-label/cross-label.component';
import {ZFTool} from './helpers/zf-tool';
import {FacilityAuditComponent} from './facility-audit/facility-audit.component';

const routes: Routes = [
  {
    path: '',
    component: SplashComponent,
  },
  {
    path: 'splash',
    component: SplashComponent,
  },
  {
    path: ZFTool.FACILITY_AUDIT.route,
    component: FacilityAuditComponent,
  },
  {
    path: 'print/tankLabel',
    outlet: 'print',
    component: PrintableTankLabelComponent,
  },
  {
    path: 'print/crossLabel',
    outlet: 'print',
    component: CrossLabelComponent,
  },
  {
    path: '**',
    component: SplashComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
