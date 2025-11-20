import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div class="max-w-md w-full">
        <div class="bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-200">
          <!-- Icono -->
          <div class="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <mat-icon class="text-white text-5xl">wifi_off</mat-icon>
          </div>
          
          <!-- Título -->
          <h1 class="text-3xl font-bold text-gray-800 mb-3">Sin Conexión a Internet</h1>
          
          <!-- Descripción -->
          <p class="text-gray-600 mb-6">
            Por favor, verifica tu conexión a internet y vuelve a intentar.
          </p>
          
          <!-- Estado de conexión -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <div class="flex items-center justify-center space-x-2">
              <div class="w-3 h-3 rounded-full" [class.bg-red-500]="!isOnline" [class.bg-green-500]="isOnline" [class.animate-pulse]="!isOnline"></div>
              <span class="text-sm font-medium text-gray-700">
                {{ isOnline ? 'Conectado' : 'Desconectado' }}
              </span>
            </div>
          </div>
          
          <!-- Botón de reintento -->
          <button 
            mat-raised-button 
            (click)="retryConnection()"
            [disabled]="!isOnline"
            class="pokemon-btn w-full">
            <mat-icon class="mr-2">refresh</mat-icon>
            {{ isOnline ? 'Reintentar' : 'Esperando conexión...' }}
          </button>
          
          <!-- Información adicional -->
          <p class="text-xs text-gray-500 mt-6">
            Esta aplicación requiere conexión a internet para funcionar correctamente.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class OfflineComponent {
  isOnline = navigator.onLine;

  constructor() {
    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  retryConnection() {
    if (this.isOnline) {
      window.location.reload();
    }
  }
}

