import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { DashboardComponent } from './components/dashboard.component';
import { TrainersComponent } from './components/trainers.component';
import { QrManagerComponent } from './components/qr-manager.component';
import { CapturesComponent } from './components/captures.component';
import { SettingsComponent } from './components/settings.component';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfessorGuard } from './core/guards/professor.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent
  },
  { 
    path: '', 
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [ProfessorGuard]
      },
      { 
        path: 'trainers', 
        component: TrainersComponent,
        canActivate: [ProfessorGuard]
      },
      { 
        path: 'captures', 
        component: CapturesComponent,
        canActivate: [ProfessorGuard]
      },
      { 
        path: 'qr-manager', 
        component: QrManagerComponent,
        canActivate: [ProfessorGuard]
      },
      { 
        path: 'settings', 
        component: SettingsComponent
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
