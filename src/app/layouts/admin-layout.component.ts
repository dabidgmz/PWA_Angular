import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/auth';
import { PokemonIconComponent } from '../shared/components/pokemon-icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    PokemonIconComponent
  ],
  template: `
    <mat-sidenav-container class="h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <mat-sidenav #sidenav mode="side" opened class="w-64 bg-white shadow-xl">
        <!-- Logo Section -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <mat-icon class="text-white text-2xl">biotech</mat-icon>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800">Profesor Oak</h2>
              <p class="text-sm text-gray-600">Panel Pokémon</p>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="p-4">
          <nav class="space-y-2">
            <a routerLink="/dashboard" routerLinkActive="active" 
               class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50 group">
              <mat-icon class="text-blue-500 group-hover:scale-110 transition-transform text-xl">dashboard</mat-icon>
              <span class="font-medium text-gray-700 group-hover:text-blue-600">Dashboard</span>
            </a>
            
            <a routerLink="/trainers" routerLinkActive="active" 
               class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-green-50 group">
              <mat-icon class="text-green-500 group-hover:scale-110 transition-transform text-xl">sports_esports</mat-icon>
              <span class="font-medium text-gray-700 group-hover:text-green-600">Entrenadores</span>
            </a>
            
            <a routerLink="/captures" routerLinkActive="active" 
               class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-yellow-50 group">
              <mat-icon class="text-yellow-500 group-hover:scale-110 transition-transform text-xl">catching_pokemon</mat-icon>
              <span class="font-medium text-gray-700 group-hover:text-yellow-600">Capturas</span>
            </a>
            
            <a routerLink="/qr-manager" routerLinkActive="active" 
               class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-purple-50 group">
              <mat-icon class="text-purple-500 group-hover:scale-110 transition-transform text-xl">qr_code_scanner</mat-icon>
              <span class="font-medium text-gray-700 group-hover:text-purple-600">QR Manager</span>
            </a>
            
            <a routerLink="/settings" routerLinkActive="active" 
               class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 group">
              <mat-icon class="text-gray-500 group-hover:scale-110 transition-transform text-xl">tune</mat-icon>
              <span class="font-medium text-gray-700 group-hover:text-gray-600">Ajustes</span>
            </a>
          </nav>
        </div>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <!-- Top Toolbar -->
        <mat-toolbar class="bg-white shadow-sm border-b border-gray-200">
          <button mat-icon-button (click)="sidenav.toggle()" class="md:hidden mr-4">
            <mat-icon class="text-gray-600 text-xl">menu</mat-icon>
          </button>
          
          <div class="flex-1"></div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <mat-icon class="text-white text-base">account_circle</mat-icon>
              </div>
              <span class="text-sm font-medium text-gray-700">{{ user?.name }}</span>
            </div>
            
            <button mat-icon-button [matMenuTriggerFor]="userMenu" class="bg-gray-50 rounded-full">
              <mat-icon class="text-gray-600 text-xl">more_vert</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu" class="rounded-xl">
              <button mat-menu-item (click)="logout()" class="rounded-lg">
                <mat-icon class="text-red-500 text-xl">exit_to_app</mat-icon>
                <span class="ml-2">Salir</span>
              </button>
            </mat-menu>
          </div>
        </mat-toolbar>
        
        <!-- Main Content -->
        <div class="p-6 min-h-screen bg-gray-50">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
      color: white !important;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
    }
    
    .active mat-icon {
      color: white !important;
    }
    
    .active span {
      color: white !important;
    }
    
    mat-sidenav {
      border-right: 1px solid #e5e7eb;
    }
    
    mat-toolbar {
      background: white !important;
    }
    
    a {
      text-decoration: none;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  user: User | null = {
    id: 'demo-user',
    email: 'demo@utt.edu.mx',
    name: 'Profesor Oak',
    role: 'prof_oak'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Usar usuario demo en lugar de obtenerlo del servicio
    // this.user = this.authService.getUser();
  }

  logout() {
    // Para demo, solo navegar al login sin limpiar datos
    this.router.navigateByUrl('/auth/login');
    // this.authService.logout();
  }
}
