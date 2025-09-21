import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { DashboardComponent } from './components/dashboard.component';
import { TrainersComponent } from './components/trainers.component';
import { QrManagerComponent } from './components/qr-manager.component';
import { CapturesComponent } from './components/captures.component';
import { SettingsComponent } from './components/settings.component';

export const routes: Routes = [
  { 
    path: '', 
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'trainers', component: TrainersComponent },
      { path: 'captures', component: CapturesComponent },
      { path: 'qr-manager', component: QrManagerComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
