import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { ToastService } from '../core/services/toast.service';
import { ThemeService } from '../core/services/theme.service';
import { storage } from '../core/utils/storage';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Configuración
        </h1>
        <p class="text-gray-600 text-lg">Ajustes del sistema Pokémon</p>
      </div>
      
      <!-- Appearance Settings -->
      <div class="glass-card p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white">palette</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Apariencia</h3>
        </div>
        
        <div class="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-xl">
          <div class="flex items-center space-x-4">
            <mat-icon [class]="isDarkTheme ? 'text-yellow-500' : 'text-gray-500'">
              {{ isDarkTheme ? 'dark_mode' : 'light_mode' }}
            </mat-icon>
            <div>
              <h4 class="font-medium text-gray-800">Modo Oscuro</h4>
              <p class="text-sm text-gray-600">Cambiar entre tema claro y oscuro</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-600" [class]="!isDarkTheme ? 'text-blue-600 font-bold' : ''">
                Claro
              </span>
              <button 
                (click)="toggleTheme()"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                [class]="isDarkTheme ? 'bg-blue-600' : 'bg-gray-200'"
                [attr.aria-label]="isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                  [class]="isDarkTheme ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
              <span class="text-sm font-medium text-gray-600" [class]="isDarkTheme ? 'text-blue-600 font-bold' : ''">
                Oscuro
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Security Settings -->
      <div class="glass-card p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white">security</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Seguridad</h3>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <mat-icon class="text-blue-500">verified_user</mat-icon>
              <div>
                <h4 class="font-medium text-gray-800">Autenticación 2FA</h4>
                <p class="text-sm text-gray-600">Configurar verificación por correo/SMS</p>
              </div>
            </div>
            <button mat-raised-button class="pokemon-btn" disabled>
              <mat-icon class="mr-2">security</mat-icon>
              Próximamente
            </button>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <mat-icon class="text-green-500">lock</mat-icon>
              <div>
                <h4 class="font-medium text-gray-800">Cambiar Contraseña</h4>
                <p class="text-sm text-gray-600">Actualizar tu contraseña de acceso</p>
              </div>
            </div>
            <button mat-raised-button class="pokemon-btn" disabled>
              <mat-icon class="mr-2">lock</mat-icon>
              Próximamente
            </button>
          </div>
        </div>
      </div>
      
      <!-- System Settings -->
      <div class="glass-card p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white">settings</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Sistema</h3>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <mat-icon class="text-red-500">delete_sweep</mat-icon>
              <div>
                <h4 class="font-medium text-gray-800">Limpiar Caché Local</h4>
                <p class="text-sm text-gray-600">Eliminar todos los datos almacenados localmente</p>
              </div>
            </div>
            <button mat-raised-button class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full" (click)="clearCache()">
              <mat-icon class="mr-2">delete_sweep</mat-icon>
              Limpiar
            </button>
          </div>
          
          <div class="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-xl">
            <div class="flex items-center space-x-4">
              <mat-icon class="text-purple-500">download</mat-icon>
              <div>
                <h4 class="font-medium text-gray-800">Exportar Configuración</h4>
                <p class="text-sm text-gray-600">Descargar configuración actual del sistema</p>
              </div>
            </div>
            <button mat-raised-button class="pokemon-btn" (click)="exportSettings()">
              <mat-icon class="mr-2">download</mat-icon>
              Exportar
            </button>
          </div>
        </div>
      </div>
      
      <!-- App Information -->
      <div class="glass-card p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white">info</mat-icon>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Información de la App</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-white bg-opacity-50 rounded-xl text-center">
            <mat-icon class="text-blue-500 text-2xl mb-2">tag</mat-icon>
            <p class="font-semibold text-gray-800">Versión</p>
            <p class="text-sm text-gray-600">1.0.0</p>
          </div>
          
          <div class="p-4 bg-white bg-opacity-50 rounded-xl text-center">
            <mat-icon class="text-green-500 text-2xl mb-2">update</mat-icon>
            <p class="font-semibold text-gray-800">Última Actualización</p>
            <p class="text-sm text-gray-600">{{ lastUpdate }}</p>
          </div>
          
          <div class="p-4 bg-white bg-opacity-50 rounded-xl text-center">
            <mat-icon class="text-purple-500 text-2xl mb-2">code</mat-icon>
            <p class="font-semibold text-gray-800">Entorno</p>
            <p class="text-sm text-gray-600">Desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit, OnDestroy {
  isDarkTheme = false;
  lastUpdate = new Date().toLocaleDateString();
  private themeSubscription?: Subscription;

  constructor(
    private toastService: ToastService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  toggleTheme() {
    const newTheme = !this.isDarkTheme;
    this.themeService.setTheme(newTheme);
    this.toastService.success(`Tema ${newTheme ? 'oscuro' : 'claro'} activado`);
  }

  clearCache() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos locales?')) {
      storage.clear();
      this.toastService.success('Caché local limpiado correctamente');
      // Reload page to reset application state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  exportSettings() {
    const settings = {
      darkTheme: this.isDarkTheme,
      lastUpdate: this.lastUpdate,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profesor-oak-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.toastService.success('Configuración exportada correctamente');
  }
}
