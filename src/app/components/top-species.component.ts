import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AdminService, TopSpecies, TopSpeciesResponse } from '../core/services/admin.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-top-species',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  template: `
    <div class="space-y-6 fade-in">
      <!-- Header -->
      <div class="text-center md:text-left">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
          🏆 Top Especies Capturadas
        </h1>
        <p class="text-gray-600 text-lg">Ranking de Pokémon más capturados en el sistema</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="glass-card p-12 text-center">
        <mat-spinner diameter="50" class="mx-auto mb-4"></mat-spinner>
        <p class="text-gray-600">Cargando ranking...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="glass-card p-6 bg-red-50 border-l-4 border-red-500">
        <div class="flex items-center space-x-2 text-red-600 mb-4">
          <mat-icon>error</mat-icon>
          <span class="font-semibold">Error al cargar ranking</span>
        </div>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button mat-raised-button (click)="loadTopSpecies()" class="bg-red-600 text-white">
          <mat-icon class="mr-2">refresh</mat-icon>
          Reintentar
        </button>
      </div>
      
      <!-- Top Species Table Card -->
      <div *ngIf="!isLoading && !error && topSpecies" class="glass-card p-6">
        <!-- Table Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2 md:mb-0">Ranking de Especies</h3>
          <div class="text-sm text-gray-600" *ngIf="totalItems > 0">
            Total: <span class="font-bold text-gray-800">{{ totalItems }}</span> especies únicas | 
            Página <span class="font-bold text-gray-800">{{ currentPage }}</span> de <span class="font-bold text-gray-800">{{ lastPage }}</span>
          </div>
        </div>
        
        <!-- Top Species Table -->
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="rank">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3 w-20">Rank</th>
              <td mat-cell *matCellDef="let species; let i = index" class="px-4 py-3">
                <div class="flex items-center justify-center">
                  <span 
                    class="font-bold text-lg"
                    [class.text-yellow-500]="getRank(i) === 1"
                    [class.text-gray-400]="getRank(i) === 2"
                    [class.text-orange-600]="getRank(i) === 3"
                    [class.text-gray-600]="getRank(i) > 3">
                    #{{ getRank(i) }}
                  </span>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="pokemon">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3">Pokémon</th>
              <td mat-cell *matCellDef="let species" class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <img 
                    [src]="getSpriteUrl(species.pokeapiId)" 
                    [alt]="species.name"
                    class="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                    (error)="onImageError($event)"
                    onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTA%2FJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tk8gSU1HPC90ZXh0Pjwvc3ZnPg%3D%3D'">
                  <div>
                    <p class="font-semibold text-gray-800 capitalize">{{ species.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ species.pokeapiId }}</p>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3">Capturas</th>
              <td mat-cell *matCellDef="let species; let i = index" class="px-4 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-lg text-gray-800">{{ species.count }}</span>
                  <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden w-32">
                    <div 
                      class="h-full rounded-full transition-all duration-700"
                      [class.bg-yellow-500]="getRank(i) === 1"
                      [class.bg-gray-400]="getRank(i) === 2"
                      [class.bg-orange-600]="getRank(i) === 3"
                      [class.bg-blue-500]="getRank(i) > 3"
                      [style.width.%]="getPercentage(species.count)"
                    ></div>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="border-b-2 border-gray-200 bg-gray-50"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"></tr>
          </table>
        </div>
        
        <!-- Pagination -->
        <div *ngIf="totalItems > 0" class="mt-6">
          <mat-paginator 
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 20, 50]"
            [pageIndex]="currentPage - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
          <div class="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Mostrando especies <span class="font-bold text-gray-800">{{ getDisplayRange().start }}</span> - 
              <span class="font-bold text-gray-800">{{ getDisplayRange().end }}</span> de 
              <span class="font-bold text-gray-800">{{ totalItems }}</span> especies únicas
            </div>
            <div class="mt-2 md:mt-0">
              Página <span class="font-bold text-gray-800">{{ currentPage }}</span> de 
              <span class="font-bold text-gray-800">{{ lastPage }}</span>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="!isLoading && totalItems === 0" class="text-center py-12 text-gray-500">
          <mat-icon class="text-6xl mb-4">emoji_events</mat-icon>
          <p class="text-lg font-semibold">No hay especies capturadas</p>
          <p class="text-sm">Aún no se han registrado capturas en el sistema</p>
        </div>
      </div>
    </div>
  `
})
export class TopSpeciesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['rank', 'pokemon', 'count'];
  dataSource = new MatTableDataSource<TopSpecies>([]);
  
  topSpecies: TopSpeciesResponse | null = null;
  currentPage = 1;
  totalItems = 0;
  lastPage = 1;
  pageSize = 10;
  
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private maxCount = 0;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadTopSpecies();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTopSpecies() {
    this.isLoading = true;
    this.error = null;

    const params = {
      page: this.currentPage,
      perPage: this.pageSize
    };

    this.adminService.getTopSpecies(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.topSpecies = response;
          this.dataSource.data = response.data;
          this.totalItems = response.meta.total;
          this.currentPage = response.meta.currentPage || this.currentPage;
          this.lastPage = response.meta.lastPage || 1;
          this.pageSize = response.meta.perPage || this.pageSize;
          
          // Calcular el máximo para el porcentaje
          if (response.data.length > 0) {
            this.maxCount = Math.max(...response.data.map(s => s.count));
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading top species:', error);
          const errorMessage = error?.error?.message || 'Error al cargar el ranking de especies';
          this.error = errorMessage;
          this.isLoading = false;
          this.toastService.error(errorMessage);
          this.dataSource.data = [];
          this.totalItems = 0;
          this.lastPage = 1;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTopSpecies();
  }

  getRank(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  getSpriteUrl(pokeapiId: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeapiId}.png`;
  }

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTA%2FJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tk8gSU1HPC90ZXh0Pjwvc3ZnPg%3D%3D';
  }

  getPercentage(count: number): number {
    if (this.maxCount === 0) return 0;
    return Math.min((count / this.maxCount) * 100, 100);
  }

  getDisplayRange(): { start: number; end: number } {
    const start = this.totalItems > 0 ? ((this.currentPage - 1) * this.pageSize) + 1 : 0;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return { start, end };
  }
}

