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
      <mat-sidenav #sidenav mode="side" opened class="w-72 bg-white shadow-2xl border-r border-gray-100">
        <!-- Logo Section -->
        <div class="sidebar-logo p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div class="flex items-center space-x-4">
            <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <mat-icon class="text-white text-3xl">biotech</mat-icon>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-1">Profesor Oak</h2>
              <p class="text-sm text-gray-600 font-medium">Panel Pokémon</p>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="p-6 flex-1">
          <nav class="space-y-3">
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Navegación</h3>
              
              <a routerLink="/dashboard" routerLinkActive="active" 
                 class="nav-item flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:bg-blue-50 group relative">
                <div class="icon-container w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                  <mat-icon class="text-blue-600 group-hover:scale-110 transition-transform text-xl">dashboard</mat-icon>
                </div>
                <span class="font-semibold text-gray-700 group-hover:text-blue-600 text-lg">Dashboard</span>
                <div class="indicator absolute right-4 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
              
              <a routerLink="/trainers" routerLinkActive="active" 
                 class="nav-item flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:bg-green-50 group relative">
                <div class="icon-container w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
                  <mat-icon class="text-green-600 group-hover:scale-110 transition-transform text-xl">sports_esports</mat-icon>
                </div>
                <span class="font-semibold text-gray-700 group-hover:text-green-600 text-lg">Entrenadores</span>
                <div class="indicator absolute right-4 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
              
              <a routerLink="/captures" routerLinkActive="active" 
                 class="nav-item flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:bg-yellow-50 group relative">
                <div class="icon-container w-10 h-10 bg-yellow-100 group-hover:bg-yellow-200 rounded-xl flex items-center justify-center transition-colors">
                  <mat-icon class="text-yellow-600 group-hover:scale-110 transition-transform text-xl">catching_pokemon</mat-icon>
                </div>
                <span class="font-semibold text-gray-700 group-hover:text-yellow-600 text-lg">Capturas</span>
                <div class="indicator absolute right-4 w-2 h-2 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
              
              <a routerLink="/qr-manager" routerLinkActive="active" 
                 class="nav-item flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:bg-purple-50 group relative">
                <div class="icon-container w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                  <mat-icon class="text-purple-600 group-hover:scale-110 transition-transform text-xl">qr_code_scanner</mat-icon>
                </div>
                <span class="font-semibold text-gray-700 group-hover:text-purple-600 text-lg">QR Manager</span>
                <div class="indicator absolute right-4 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            </div>
            
            <!-- Settings Section -->
            <div class="mt-8 pt-6 border-t border-gray-100">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Configuración</h3>
              
              <a routerLink="/settings" routerLinkActive="active" 
                 class="nav-item flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 hover:bg-gray-50 group relative">
                <div class="icon-container w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                  <mat-icon class="text-gray-600 group-hover:scale-110 transition-transform text-xl">tune</mat-icon>
                </div>
                <span class="font-semibold text-gray-700 group-hover:text-gray-600 text-lg">Ajustes</span>
                <div class="indicator absolute right-4 w-2 h-2 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            </div>
          </nav>
        </div>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <!-- Top Toolbar -->
        <mat-toolbar class="bg-white shadow-sm border-b border-gray-200">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-button md:hidden mr-4">
            <mat-icon class="text-gray-600 text-xl">menu</mat-icon>
          </button>
          
          <div class="flex-1"></div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="user-info hidden md:flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center user-avatar">
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
        <div class="main-content p-6 min-h-screen bg-gray-50">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
      color: white !important;
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
      transform: translateX(4px) !important;
    }
    
    .active .icon-container {
      background: rgba(255, 255, 255, 0.2) !important;
    }
    
    .active mat-icon {
      color: white !important;
    }
    
    .active span {
      color: white !important;
      font-weight: 700 !important;
    }
    
    .active .indicator {
      opacity: 1 !important;
      background: white !important;
    }
    
    mat-sidenav {
      border-right: 1px solid #e5e7eb;
      backdrop-filter: blur(10px);
    }
    
    mat-toolbar {
      background: white !important;
    }
    
    a {
      text-decoration: none;
    }
    
    /* Centrar iconos de Material Design */
    .mat-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    /* Centrar específicamente el avatar del usuario */
    .user-avatar mat-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
    }
    
    /* Estilos mejorados para el sidebar */
    .sidebar-logo {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    
    .nav-item {
      position: relative;
      overflow: hidden;
    }
    
    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 3px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }
    
    .nav-item:hover::before {
      transform: scaleY(1);
    }
    
    .active::before {
      transform: scaleY(1) !important;
    }
    
    /* Iconos con mejor diseño */
    .icon-container {
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .nav-item:hover .icon-container {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }
    
    /* Indicador de estado activo */
    .indicator {
      transition: all 0.3s ease;
    }
    
    /* Animación de entrada */
    .nav-item {
      animation: slideInLeft 0.3s ease forwards;
      opacity: 0;
      transform: translateX(-20px);
    }
    
    .nav-item:nth-child(1) { animation-delay: 0.1s; }
    .nav-item:nth-child(2) { animation-delay: 0.2s; }
    .nav-item:nth-child(3) { animation-delay: 0.3s; }
    .nav-item:nth-child(4) { animation-delay: 0.4s; }
    .nav-item:nth-child(5) { animation-delay: 0.5s; }
    
    @keyframes slideInLeft {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Mejoras responsivas para el nuevo diseño */
    @media (max-width: 768px) {
      .sidebar-logo {
        padding: 1.5rem !important;
      }
      
      .sidebar-logo h2 {
        font-size: 1.25rem !important;
      }
      
      .nav-item {
        padding: 0.75rem 1rem !important;
        margin: 0.25rem 0 !important;
      }
      
      .nav-item span {
        font-size: 0.875rem !important;
      }
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
