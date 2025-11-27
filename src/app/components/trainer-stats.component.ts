import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { AdminService, TrainerStatsForChartsResponse } from '../core/services/admin.service';
import { ToastService } from '../core/services/toast.service';
import { NetworkService } from '../core/services/network.service';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables
} from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

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

      <!-- Offline Message -->
      <div *ngIf="!isOnline" class="glass-card p-6 bg-yellow-50 border-l-4 border-yellow-400">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <mat-icon class="text-yellow-600 text-4xl">cloud_off</mat-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-yellow-800 mb-2">Sin Conexión a Internet</h3>
            <p class="text-yellow-700 mb-2">Por favor, verifica tu conexión a internet y vuelve a intentar.</p>
            <div class="flex items-center space-x-2 mt-4">
              <mat-icon class="text-yellow-600">wifi_off</mat-icon>
              <span class="text-yellow-800 font-medium">Desconectado</span>
            </div>
            <p class="text-sm text-yellow-700 mt-2">Esta aplicación requiere conexión a internet para funcionar correctamente.</p>
          </div>
        </div>
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
          
          <!-- Status Distribution Doughnut Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-indigo-500">pie_chart</mat-icon>
              Distribución por Estado
            </h3>
            <div class="flex flex-col items-center">
              <div class="w-full max-w-md mb-4">
                <canvas #statusChartCanvas></canvas>
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
            <div class="w-full">
              <canvas #teamChartCanvas></canvas>
            </div>
          </div>

          <!-- Registration Timeline Line Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-green-500">show_chart</mat-icon>
              Registros (Últimos 30 días)
            </h3>
            <div class="w-full">
              <canvas #timelineChartCanvas></canvas>
            </div>
            <div *ngIf="stats.registrationTimeline.length === 0" class="text-center py-8 text-gray-500">
              <mat-icon class="text-4xl mb-2">timeline</mat-icon>
              <p>No hay datos de registros disponibles</p>
            </div>
          </div>

          <!-- Captures by Rarity Doughnut Chart -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <mat-icon class="mr-2 text-purple-500">donut_large</mat-icon>
              Capturas por Rareza
            </h3>
            <div class="flex flex-col items-center">
              <div class="w-full max-w-md mb-4">
                <canvas #rarityChartCanvas></canvas>
              </div>
              <div class="grid grid-cols-2 gap-4 w-full">
                <div *ngFor="let item of stats.capturesByRarity" class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-2 mb-1">
                    <div 
                      class="w-4 h-4 rounded-full" 
                      [class.bg-gray-400]="item.rarity === 'common'"
                      [class.bg-blue-400]="item.rarity === 'rare'"
                      [class.bg-purple-400]="item.rarity === 'epic'"
                      [class.bg-yellow-400]="item.rarity === 'legend'"
                    ></div>
                    <span class="font-semibold text-gray-800 capitalize text-sm">{{ getRarityLabel(item.rarity) }}</span>
                  </div>
                  <p class="text-xl font-bold text-gray-800">{{ item.count }}</p>
                  <p class="text-xs text-gray-600">{{ item.percentage }}%</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Pokemon Distribution Bar Chart -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <mat-icon class="mr-2 text-pink-500">bar_chart</mat-icon>
            Distribución de Pokémon por Entrenador
          </h3>
          <div class="w-full">
            <canvas #pokemonChartCanvas></canvas>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    canvas {
      max-height: 400px;
    }
  `]
})
export class TrainerStatsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('statusChartCanvas') statusChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('teamChartCanvas') teamChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('timelineChartCanvas') timelineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rarityChartCanvas') rarityChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pokemonChartCanvas') pokemonChartCanvas!: ElementRef<HTMLCanvasElement>;

  stats: TrainerStatsForChartsResponse | null = null;
  isLoading = false;
  error: string | null = null;
  isOnline = true;
  private destroy$ = new Subject<void>();
  
  private statusChart: Chart | null = null;
  private teamChart: Chart | null = null;
  private timelineChart: Chart | null = null;
  private rarityChart: Chart | null = null;
  private pokemonChart: Chart | null = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private networkService: NetworkService
  ) {}

  ngOnInit() {
    // Suscribirse al estado de la red
    this.networkService.onlineStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isOnline = status;
        if (!status) {
          this.toastService.warning('Sin conexión a internet. Algunas funciones están deshabilitadas.');
        } else if (this.stats === null) {
          // Si se reconecta y no hay datos, cargar estadísticas
          this.loadStats();
        }
      });
    
    // Cargar estadísticas solo si hay conexión
    if (this.isOnline) {
      this.loadStats();
    } else {
      this.toastService.warning('Sin conexión a internet. No se pueden cargar las estadísticas.');
    }
  }

  ngAfterViewInit() {
    // Los gráficos se crearán después de cargar los datos
  }

  ngOnDestroy() {
    // Destruir todos los gráficos
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.teamChart) {
      this.teamChart.destroy();
    }
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }
    if (this.rarityChart) {
      this.rarityChart.destroy();
    }
    if (this.pokemonChart) {
      this.pokemonChart.destroy();
    }
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
          // Crear gráficos después de un breve delay para asegurar que los canvas estén listos
          setTimeout(() => {
            this.createCharts();
          }, 100);
        },
        error: (error) => {
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


  getRarityLabel(rarity: string): string {
    const labels: { [key: string]: string } = {
      'common': 'Común',
      'rare': 'Raro',
      'epic': 'Épico',
      'legend': 'Legendario'
    };
    return labels[rarity] || rarity;
  }


  private createCharts(): void {
    if (!this.stats) return;

    // Destruir gráficos existentes si existen
    this.destroyCharts();

    // Crear gráfico de distribución por estado (Doughnut)
    this.createStatusChart();
    
    // Crear gráfico de distribución de equipos (Bar)
    this.createTeamChart();
    
    // Crear gráfico de timeline de registros (Line)
    this.createTimelineChart();
    
    // Crear gráfico de capturas por rareza (Doughnut)
    this.createRarityChart();
    
    // Crear gráfico de distribución de Pokémon (Bar)
    this.createPokemonChart();
  }

  private destroyCharts(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
      this.statusChart = null;
    }
    if (this.teamChart) {
      this.teamChart.destroy();
      this.teamChart = null;
    }
    if (this.timelineChart) {
      this.timelineChart.destroy();
      this.timelineChart = null;
    }
    if (this.rarityChart) {
      this.rarityChart.destroy();
      this.rarityChart = null;
    }
    if (this.pokemonChart) {
      this.pokemonChart.destroy();
      this.pokemonChart = null;
    }
  }

  private createStatusChart(): void {
    if (!this.statusChartCanvas || !this.stats) return;

    const ctx = this.statusChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data: ChartData<'doughnut'> = {
      labels: this.stats.statusDistribution.map(item => item.label),
      datasets: [{
        data: this.stats.statusDistribution.map(item => item.value),
        backgroundColor: this.stats.statusDistribution.map(item => item.color),
        borderWidth: 3,
        borderColor: '#ffffff'
      }]
    };

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = this.stats?.overview.total || 1;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    };

    this.statusChart = new Chart(ctx, config);
  }

  private createTeamChart(): void {
    if (!this.teamChartCanvas || !this.stats) return;

    const ctx = this.teamChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data: ChartData<'bar'> = {
      labels: this.stats.teamDistribution.map(item => item.range),
      datasets: [{
        label: 'Entrenadores',
        data: this.stats.teamDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 2
      }]
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Entrenadores: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.teamChart = new Chart(ctx, config);
  }

  private createTimelineChart(): void {
    if (!this.timelineChartCanvas || !this.stats || this.stats.registrationTimeline.length === 0) return;

    const ctx = this.timelineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.stats.registrationTimeline.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });

    const data: ChartData<'line'> = {
      labels: labels,
      datasets: [
        {
          label: 'Registros Diarios',
          data: this.stats.registrationTimeline.map(item => item.count),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Total Acumulado',
          data: this.stats.registrationTimeline.map(item => item.cumulative),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1'
        }
      ]
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            position: 'left',
            ticks: {
              stepSize: 1
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    };

    this.timelineChart = new Chart(ctx, config);
  }

  private createRarityChart(): void {
    if (!this.rarityChartCanvas || !this.stats) return;

    const ctx = this.rarityChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const rarityColors: { [key: string]: string } = {
      'common': 'rgba(156, 163, 175, 0.8)',
      'rare': 'rgba(59, 130, 246, 0.8)',
      'epic': 'rgba(147, 51, 234, 0.8)',
      'legend': 'rgba(234, 179, 8, 0.8)'
    };

    const data: ChartData<'doughnut'> = {
      labels: this.stats.capturesByRarity.map(item => this.getRarityLabel(item.rarity)),
      datasets: [{
        data: this.stats.capturesByRarity.map(item => item.count),
        backgroundColor: this.stats.capturesByRarity.map(item => rarityColors[item.rarity] || 'rgba(156, 163, 175, 0.8)'),
        borderWidth: 3,
        borderColor: '#ffffff'
      }]
    };

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const item = this.stats?.capturesByRarity[context.dataIndex];
                const percentage = item?.percentage || 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    };

    this.rarityChart = new Chart(ctx, config);
  }

  private createPokemonChart(): void {
    if (!this.pokemonChartCanvas || !this.stats) return;

    const ctx = this.pokemonChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data: ChartData<'bar'> = {
      labels: this.stats.pokemonDistribution.map(item => item.range),
      datasets: [{
        label: 'Entrenadores',
        data: this.stats.pokemonDistribution.map(item => item.count),
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
        borderRadius: 4
      }]
    };

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} entrenadores`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.pokemonChart = new Chart(ctx, config);
  }
}

