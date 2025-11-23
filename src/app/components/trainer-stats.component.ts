import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { AdminService, TrainerStatsForChartsResponse } from '../core/services/admin.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-trainer-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule
  ],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Estadísticas de Entrenadores
        </h1>
        <p class="text-gray-600 text-lg">Visualización de datos y gráficos</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-12">
        <mat-spinner diameter="50" class="mx-auto mb-4"></mat-spinner>
        <p class="text-gray-600">Cargando estadísticas...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="glass-card p-6 bg-red-50 border border-red-200">
        <div class="flex items-center space-x-2 text-red-600">
          <mat-icon>error</mat-icon>
          <span>{{ error }}</span>
        </div>
        <button mat-raised-button (click)="loadStats()" class="mt-4">
          <mat-icon class="mr-2">refresh</mat-icon>
          Reintentar
        </button>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && !error && stats" class="space-y-6">
        
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total</p>
                <h3 class="text-3xl font-bold text-blue-800">{{ stats.overview.total }}</h3>
                <p class="text-xs text-gray-600 mt-1">Entrenadores</p>
              </div>
              <mat-icon class="text-blue-500 text-4xl">people</mat-icon>
            </div>
          </div>
          
          <div class="glass-card p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Activos</p>
                <h3 class="text-3xl font-bold text-green-800">{{ stats.overview.active }}</h3>
                <p class="text-xs text-gray-600 mt-1">{{ getPercentage(stats.overview.active, stats.overview.total) }}% del total</p>
              </div>
              <mat-icon class="text-green-500 text-4xl">check_circle</mat-icon>
            </div>
          </div>
          
          <div class="glass-card p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Baneados</p>
                <h3 class="text-3xl font-bold text-red-800">{{ stats.overview.banned }}</h3>
                <p class="text-xs text-gray-600 mt-1">{{ getPercentage(stats.overview.banned, stats.overview.total) }}% del total</p>
              </div>
              <mat-icon class="text-red-500 text-4xl">block</mat-icon>
            </div>
          </div>
          
          <div class="glass-card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">No Verificados</p>
                <h3 class="text-3xl font-bold text-yellow-800">{{ stats.overview.unverified }}</h3>
                <p class="text-xs text-gray-600 mt-1">{{ getPercentage(stats.overview.unverified, stats.overview.total) }}% del total</p>
              </div>
              <mat-icon class="text-yellow-500 text-4xl">warning</mat-icon>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Status Distribution Pie Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-indigo-500">pie_chart</mat-icon>
              Distribución por Estado
            </h3>
            <div class="flex flex-col items-center">
              <div class="pie-chart-container relative w-64 h-64 mb-4">
                <svg width="256" height="256" class="transform -rotate-90">
                  <circle
                    *ngFor="let item of stats.statusDistribution; let i = index"
                    [attr.cx]="128"
                    [attr.cy]="128"
                    [attr.r]="100"
                    [attr.fill]="item.color"
                    [attr.stroke]="'white'"
                    [attr.stroke-width]="4"
                    [style.stroke-dasharray]="getStrokeDashArray(item.percentage, i)"
                    [style.stroke-dashoffset]="getStrokeDashOffset(i)"
                    class="transition-all duration-500"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <p class="text-3xl font-bold text-gray-800">{{ stats.overview.total }}</p>
                    <p class="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </div>
              <div class="space-y-2 w-full">
                <div *ngFor="let item of stats.statusDistribution" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 rounded-full" [style.backgroundColor]="item.color"></div>
                    <span class="font-semibold text-gray-800">{{ item.label }}</span>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-800">{{ item.value }}</p>
                    <p class="text-xs text-gray-600">{{ item.percentage }}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Distribution Bar Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-blue-500">bar_chart</mat-icon>
              Distribución de Equipos
            </h3>
            <div class="space-y-4">
              <div *ngFor="let item of stats.teamDistribution; let i = index" class="flex items-center space-x-4">
                <div class="w-24 text-sm font-semibold text-gray-700">{{ item.range }}</div>
                <div class="flex-1">
                  <div class="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                      [style.backgroundColor]="getTeamColor(i)"
                      [style.width.%]="getPercentage(item.count, getMaxTeamCount())"
                    ></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-sm font-bold text-gray-800">{{ item.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Registration Timeline Line Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-green-500">show_chart</mat-icon>
              Registros (Últimos 30 días)
            </h3>
            <div class="space-y-3">
              <div *ngFor="let item of stats.registrationTimeline" class="flex items-center space-x-4">
                <div class="w-24 text-xs text-gray-600">{{ item.date | date:'d/M' }}</div>
                <div class="flex-1 flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div 
                      class="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                      [style.width.%]="getTimelinePercentage('count', item.count)"
                    ></div>
                    <span class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {{ item.count }} diarios
                    </span>
                  </div>
                </div>
                <div class="w-32 text-right text-sm font-semibold text-gray-700">
                  Total: {{ item.cumulative }}
                </div>
              </div>
              <div *ngIf="stats.registrationTimeline.length === 0" class="text-center py-8 text-gray-500">
                <mat-icon class="text-4xl mb-2">timeline</mat-icon>
                <p>No hay datos de registros disponibles</p>
              </div>
            </div>
          </div>

          <!-- Captures by Rarity Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-purple-500">donut_large</mat-icon>
              Capturas por Rareza
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div *ngFor="let item of stats.capturesByRarity" class="p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-2 mb-2">
                  <div 
                    class="w-4 h-4 rounded-full" 
                    [class.bg-gray-400]="item.rarity === 'common'"
                    [class.bg-blue-400]="item.rarity === 'rare'"
                    [class.bg-purple-400]="item.rarity === 'epic'"
                    [class.bg-yellow-400]="item.rarity === 'legend'"
                  ></div>
                  <span class="font-semibold text-gray-800 capitalize">{{ getRarityLabel(item.rarity) }}</span>
                </div>
                <p class="text-2xl font-bold text-gray-800">{{ item.count }}</p>
                <p class="text-xs text-gray-600">{{ item.percentage }}%</p>
                <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-700"
                    [class.bg-gray-400]="item.rarity === 'common'"
                    [class.bg-blue-400]="item.rarity === 'rare'"
                    [class.bg-purple-400]="item.rarity === 'epic'"
                    [class.bg-yellow-400]="item.rarity === 'legend'"
                    [style.width.%]="item.percentage"
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Pokemon Distribution -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <mat-icon class="mr-2 text-pink-500">bar_chart</mat-icon>
            Distribución de Pokémon por Entrenador
          </h3>
          <div class="space-y-4">
            <div *ngFor="let item of stats.pokemonDistribution" class="flex items-center space-x-4">
              <div class="w-32 text-sm font-semibold text-gray-700">{{ item.range }}</div>
              <div class="flex-1">
                <div class="relative h-10 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-700"
                    [style.width.%]="getPercentage(item.count, getMaxPokemonCount())"
                  ></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm font-bold text-white">{{ item.count }} entrenadores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .pie-chart-container circle {
      opacity: 0;
      animation: fadeIn 0.5s ease-in forwards;
    }
    
    .pie-chart-container circle:nth-child(1) { animation-delay: 0.1s; }
    .pie-chart-container circle:nth-child(2) { animation-delay: 0.2s; }
    .pie-chart-container circle:nth-child(3) { animation-delay: 0.3s; }
    
    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }
  `]
})
export class TrainerStatsComponent implements OnInit, OnDestroy {
  stats: TrainerStatsForChartsResponse | null = null;
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats() {
    this.isLoading = true;
    this.error = null;

    this.adminService.getTrainerStatsForCharts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading trainer stats:', error);
          const errorMessage = error?.error?.message || 'Error al cargar las estadísticas';
          this.error = errorMessage;
          this.isLoading = false;
          this.toastService.error(errorMessage);
        }
      });
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getTeamColor(index: number): string {
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
    return colors[index] || '#6b7280';
  }

  getMaxTeamCount(): number {
    if (!this.stats) return 1;
    return Math.max(...this.stats.teamDistribution.map(item => item.count));
  }

  getMaxPokemonCount(): number {
    if (!this.stats) return 1;
    return Math.max(...this.stats.pokemonDistribution.map(item => item.count));
  }

  getRarityLabel(rarity: string): string {
    const labels: { [key: string]: string } = {
      'common': 'Común',
      'rare': 'Raro',
      'epic': 'Épico',
      'legend': 'Legendario'
    };
    return labels[rarity] || rarity;
  }

  getStrokeDashArray(percentage: number, index: number): string {
    const circumference = 2 * Math.PI * 100;
    const previousPercentage = this.stats?.statusDistribution
      .slice(0, index)
      .reduce((sum, item) => sum + item.percentage, 0) || 0;
    const dashLength = (circumference * percentage) / 100;
    return `${dashLength} ${circumference}`;
  }

  getStrokeDashOffset(index: number): number {
    if (!this.stats) return 0;
    const circumference = 2 * Math.PI * 100;
    const previousPercentage = this.stats.statusDistribution
      .slice(0, index)
      .reduce((sum, item) => sum + item.percentage, 0);
    return -((circumference * previousPercentage) / 100);
  }

  getTimelinePercentage(type: 'count', value: number): number {
    if (!this.stats || this.stats.registrationTimeline.length === 0) return 0;
    const maxValue = Math.max(...this.stats.registrationTimeline.map(item => item.count), 1);
    return Math.min((value / maxValue) * 100, 100);
  }
}

