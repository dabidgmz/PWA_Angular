import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../core/services/admin.service';
import { PokemonIconComponent } from '../shared/components/pokemon-icon.component';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatSnackBarModule, PokemonIconComponent],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="dashboard-header text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard Pokémon
        </h1>
        <p class="text-gray-600 text-lg">Resumen del sistema PokeTrainer</p>
      </div>
      
      <!-- Backend Warning -->
      <div *ngIf="!isBackendAvailable" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
        <div class="flex items-center">
          <mat-icon class="text-yellow-600 mr-3">warning</mat-icon>
          <div>
            <h3 class="text-yellow-800 font-semibold">Backend no disponible</h3>
            <p class="text-yellow-700 text-sm">No se pudo conectar con el servidor. Mostrando datos de demostración. Asegúrate de que el backend esté disponible en <code class="bg-yellow-100 px-2 py-1 rounded">https://jrctesthub.live</code></p>
          </div>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Total Trainers -->
        <div class="stat-card bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-red-800">{{ totalTrainers }}</h3>
              <p class="text-red-600 mt-1">Total Entrenadores</p>
              <div class="flex items-center mt-2">
                <span class="text-sm font-medium" [class.text-green-600]="trainersChangePercent >= 0" [class.text-red-600]="trainersChangePercent < 0">
                  {{ trainersChangePercent >= 0 ? '+' : '' }}{{ trainersChangePercent }}%
                </span>
                <span class="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div class="stat-icon w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <app-pokemon-icon type="trainer" size="2xl" class="text-white"></app-pokemon-icon>
            </div>
          </div>
        </div>
        
        <!-- Total Captures -->
        <div class="stat-card bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-green-800">{{ totalCaptures }}</h3>
              <p class="text-green-600 mt-1">Capturas Totales</p>
              <div class="flex items-center mt-2">
                <span class="text-sm font-medium" [class.text-green-600]="capturesChangePercent >= 0" [class.text-red-600]="capturesChangePercent < 0">
                  {{ capturesChangePercent >= 0 ? '+' : '' }}{{ capturesChangePercent }}%
                </span>
                <span class="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div class="stat-icon w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <mat-icon class="text-white text-4xl">catching_pokemon</mat-icon>
            </div>
          </div>
        </div>
        
        <!-- Active Trainers -->
        <div class="stat-card bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-purple-800">{{ activeTrainers }}</h3>
              <p class="text-purple-600 mt-1">Entrenadores Activos</p>
              <div class="flex items-center mt-2">
                <span class="text-sm font-medium" [class.text-green-600]="activeTrainersChangePercent >= 0" [class.text-red-600]="activeTrainersChangePercent < 0">
                  {{ activeTrainersChangePercent >= 0 ? '+' : '' }}{{ activeTrainersChangePercent }}%
                </span>
                <span class="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div class="stat-icon w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <app-pokemon-icon type="star" size="2xl" class="text-white"></app-pokemon-icon>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Top Species -->
      <div class="top-species-card content-card bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <mat-icon class="text-white text-2xl">emoji_events</mat-icon>
          </div>
          <h3 class="text-2xl font-bold text-gray-800">Top Especies Capturadas</h3>
        </div>
        
        <div class="space-y-4">
          <div *ngFor="let species of topSpecies; let i = index" 
               class="species-item flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-100">
            <div class="species-info flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                <mat-icon class="text-white text-xl">pets</mat-icon>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800 capitalize">{{ species.name }}</h4>
                <p class="text-sm text-gray-600">Especie Pokémon</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-gray-800">{{ species.count }}</p>
              <p class="text-sm text-gray-600">capturas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  totalTrainers = 0;
  totalCaptures = 0;
  activeTrainers = 0;
  trainersChangePercent = 0;
  capturesChangePercent = 0;
  activeTrainersChangePercent = 0;
  topSpecies: Array<{ name: string; count: number }> = [];
  isLoading = true;
  isBackendAvailable = true;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadTopSpecies();
  }

  loadStatistics() {
    this.adminService.getStatistics().subscribe({
      next: (stats) => {
        this.totalTrainers = stats.trainers.current;
        this.totalCaptures = stats.captures.current;
        this.activeTrainers = stats.activeTrainers.current;
        this.trainersChangePercent = stats.trainers.changePercent;
        this.capturesChangePercent = stats.captures.changePercent;
        this.activeTrainersChangePercent = stats.activeTrainers.changePercent;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.isBackendAvailable = false;
        
        // Si el backend no está disponible (status 0), mostrar mensaje y usar datos demo
        if (error.status === 0) {
          this.toastService.warning('Backend no disponible. Mostrando datos de demostración.');
        } else {
          this.toastService.error('Error al cargar estadísticas. Mostrando datos de demostración.');
        }
        
        // Fallback a datos demo en caso de error
        this.loadDemoData();
      }
    });
  }

  loadTopSpecies() {
    this.adminService.getTopSpecies().subscribe({
      next: (response) => {
        this.topSpecies = response.data.map(species => ({
          name: species.name,
          count: species.count
        }));
      },
      error: (error) => {
        // Fallback a datos demo
        this.topSpecies = [
          { name: 'pikachu', count: 45 },
          { name: 'charizard', count: 32 },
          { name: 'blastoise', count: 28 },
          { name: 'venusaur', count: 25 },
          { name: 'mewtwo', count: 12 }
        ];
      }
    });
  }

  private loadDemoData() {
    this.totalTrainers = 25;
    this.totalCaptures = 4;
    this.activeTrainers = 4;
    this.trainersChangePercent = 12;
    this.capturesChangePercent = 8;
    this.activeTrainersChangePercent = 15;
  }
}
