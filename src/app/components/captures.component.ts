import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RarityType } from '../core/models/capture';
import { AdminService, Capture } from '../core/services/admin.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-captures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="space-y-6 fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="text-center md:text-left mb-4 md:mb-0">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Capturas Pokémon
          </h1>
          <p class="text-gray-600 text-lg">Historial de capturas del sistema</p>
        </div>
        <button 
          mat-raised-button 
          class="pokemon-btn" 
          (click)="exportCSV()"
          [disabled]="isLoading || totalItems === 0">
          <mat-icon class="mr-2">download</mat-icon>
          Exportar CSV
        </button>
      </div>
      
      <!-- Filters Card -->
      <div class="glass-card p-6">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Filtros de Búsqueda</h3>
          <button 
            *ngIf="searchTerm || speciesFilter || rarityFilter || dateFilter"
            mat-button 
            (click)="clearFilters()"
            class="text-sm text-red-600 hover:bg-red-50 rounded-lg px-3 py-2">
            <mat-icon class="text-sm mr-1">clear</mat-icon>
            Limpiar Filtros
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Buscar</mat-label>
            <input 
              matInput 
              (keyup.enter)="applyFilter()" 
              [(ngModel)]="searchTerm" 
              placeholder="Entrenador o especie" 
              class="text-gray-800">
            <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
            <button 
              *ngIf="searchTerm" 
              matSuffix 
              mat-icon-button 
              (click)="searchTerm = ''; applyFilter()"
              type="button"
              aria-label="Limpiar búsqueda">
              <mat-icon class="text-gray-400">close</mat-icon>
            </button>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Especie</mat-label>
            <mat-select [(ngModel)]="speciesFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let species of species" [value]="species">
                <span class="capitalize">{{ species }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Rareza</mat-label>
            <mat-select [(ngModel)]="rarityFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let rarity of rarities" [value]="rarity">
                <span class="capitalize">{{ rarity === 'legend' ? 'Legendario' : (rarity === 'common' ? 'Común' : (rarity === 'rare' ? 'Raro' : 'Épico')) }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Fecha</mat-label>
            <input 
              matInput 
              [matDatepicker]="picker"
              placeholder="Seleccionar fecha"
              [(ngModel)]="dateFilter"
              (dateChange)="onDateChange()"
              class="text-gray-800 cursor-pointer">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="glass-card p-12 text-center">
        <mat-spinner diameter="50" class="mx-auto mb-4"></mat-spinner>
        <p class="text-gray-600">Cargando capturas...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="glass-card p-6 bg-red-50 border-l-4 border-red-500">
        <div class="flex items-center space-x-2 text-red-600 mb-4">
          <mat-icon>error</mat-icon>
          <span class="font-semibold">Error al cargar capturas</span>
        </div>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button mat-raised-button (click)="loadCaptures()" class="bg-red-600 text-white">
          <mat-icon class="mr-2">refresh</mat-icon>
          Reintentar
        </button>
      </div>
      
      <!-- Captures Table Card -->
      <div *ngIf="!isLoading && !error" class="glass-card p-6">
        <!-- Table Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Historial de Capturas</h3>
          <div class="text-sm text-gray-600" *ngIf="totalItems > 0">
            Total: <span class="font-bold text-gray-800">{{ totalItems }}</span> capturas | 
            Página <span class="font-bold text-gray-800">{{ currentPage }}</span> de <span class="font-bold text-gray-800">{{ lastPage }}</span>
          </div>
        </div>
        
        <!-- Captures Table -->
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="trainerName">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3">Entrenador</th>
              <td mat-cell *matCellDef="let capture" class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <mat-icon class="text-white text-sm">person</mat-icon>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ capture.trainer.name }}</p>
                    <p class="text-xs text-gray-500">{{ capture.trainer.email }}</p>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="species">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3">Pokémon</th>
              <td mat-cell *matCellDef="let capture" class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <img 
                    *ngIf="capture.pokemon.spriteUrl" 
                    [src]="capture.pokemon.spriteUrl" 
                    [alt]="capture.pokemon.name"
                    class="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                    onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTA%2FJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tk8gSU1HPC90ZXh0Pjwvc3ZnPg%3D%3D'">
                  <mat-icon *ngIf="!capture.pokemon.spriteUrl" class="text-yellow-500">pets</mat-icon>
                  <div>
                    <p class="font-semibold text-gray-800 capitalize">{{ capture.pokemon.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ capture.pokemon.pokeapiId }}</p>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="rarity">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3">Rareza</th>
              <td mat-cell *matCellDef="let capture" class="px-4 py-3">
                <span 
                  class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                  [class.bg-gray-100]="capture.rarity === 'common'"
                  [class.text-gray-700]="capture.rarity === 'common'"
                  [class.bg-blue-100]="capture.rarity === 'rare'"
                  [class.text-blue-700]="capture.rarity === 'rare'"
                  [class.bg-purple-100]="capture.rarity === 'epic'"
                  [class.text-purple-700]="capture.rarity === 'epic'"
                  [class.bg-yellow-100]="capture.rarity === 'legend'"
                  [class.text-yellow-700]="capture.rarity === 'legend'"
                >
                  {{ capture.rarity === 'legend' ? 'Legendario' : (capture.rarity === 'common' ? 'Común' : (capture.rarity === 'rare' ? 'Raro' : 'Épico')) }}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold px-4 py-3">Fecha</th>
              <td mat-cell *matCellDef="let capture" class="px-4 py-3">
                <div class="flex items-center space-x-2">
                  <mat-icon class="text-gray-400 text-sm">schedule</mat-icon>
                  <span class="text-gray-800 text-sm">{{ capture.formattedDate?.full || (capture.capturedAt | date:'short') }}</span>
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
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageIndex]="currentPage - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
          <div class="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Mostrando <span class="font-bold text-gray-800">{{ getDisplayRange().start }}</span> - 
              <span class="font-bold text-gray-800">{{ getDisplayRange().end }}</span> de 
              <span class="font-bold text-gray-800">{{ totalItems }}</span> capturas
            </div>
            <div class="mt-2 md:mt-0">
              Página <span class="font-bold text-gray-800">{{ currentPage }}</span> de 
              <span class="font-bold text-gray-800">{{ lastPage }}</span>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="!isLoading && totalItems === 0" class="text-center py-12 text-gray-500">
          <mat-icon class="text-6xl mb-4">inbox</mat-icon>
          <p class="text-lg font-semibold">No se encontraron capturas</p>
          <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    </div>
  `
})
export class CapturesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['trainerName', 'species', 'rarity', 'date'];
  dataSource = new MatTableDataSource<Capture>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  searchTerm = '';
  speciesFilter = '';
  rarityFilter = '';
  dateFilter: Date | null = null;
  currentPage = 1;
  totalItems = 0;
  lastPage = 1;
  pageSize = 50;
  
  species: string[] = [];
  rarities: RarityType[] = ['common', 'rare', 'epic', 'legend'];
  isLoading = false;
  private destroy$ = new Subject<void>();

  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadCaptures();
  }
  
  loadCaptures() {
    this.isLoading = true;
    this.error = null;
    
    const params: any = {
      page: this.currentPage,
      perPage: this.pageSize
    };
    
    // Si hay búsqueda de texto, incluirla
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    
    // Filtrar por especie - el backend busca por nombre de Pokémon
    if (this.speciesFilter && this.speciesFilter !== '') {
      // Si hay búsqueda de texto, combinar con especie
      if (this.searchTerm && this.searchTerm.trim()) {
        // Combinar búsqueda con especie
        params.search = `${this.searchTerm.trim()} ${this.speciesFilter}`;
      } else {
        // Solo buscar por especie
        params.search = this.speciesFilter;
      }
    }
    
    // Nota: El endpoint actual no soporta filtro por rarity directamente
    // Si el backend lo soporta, se podría agregar aquí
    // Por ahora, si hay filtro por rareza, se aplicaría en el frontend
    
    // Filtrar por fecha
    if (this.dateFilter) {
      const dateStr = this.dateFilter.toISOString().split('T')[0];
      params.dateFrom = dateStr;
      params.dateTo = dateStr;
    }
    
    this.adminService.getCaptureHistory(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.meta.total;
        this.currentPage = response.meta.currentPage || this.currentPage;
        this.lastPage = response.meta.lastPage || 1;
        this.pageSize = response.meta.perPage || this.pageSize;
        
        // Actualizar el paginator después de recibir los datos
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.length = this.totalItems;
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
          }
        }, 100);
        
        // Extraer especies únicas para el filtro
        const uniqueSpecies = new Set<string>();
        response.data.forEach(capture => {
          uniqueSpecies.add(capture.pokemon.name);
        });
        this.species = Array.from(new Set([...this.species, ...Array.from(uniqueSpecies)])).sort();
        
        this.isLoading = false;
      },
      error: (error) => {
          const errorMessage = error?.error?.message || 'Error al cargar las capturas';
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
          this.loadCaptures();
  }

  onDateChange() {
          this.currentPage = 1;
          this.loadCaptures();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(): void {
    this.currentPage = 1;
    // Reset paginator si existe
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadCaptures();
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.speciesFilter = '';
    this.rarityFilter = '';
    this.dateFilter = null;
    this.applyFilter();
  }
  
  getDisplayRange(): { start: number; end: number } {
    const start = this.totalItems > 0 ? ((this.currentPage - 1) * this.pageSize) + 1 : 0;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return { start, end };
  }

  exportCSV() {
    const headers = ['ID', 'Entrenador', 'Email', 'Pokémon', 'ID PokeAPI', 'Rareza', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...this.dataSource.data.map(capture => [
        capture.id,
        `"${capture.trainer.name}"`,
        capture.trainer.email,
        capture.pokemon.name,
        capture.pokemon.pokeapiId,
        capture.rarity,
        `"${capture.formattedDate?.full || new Date(capture.capturedAt).toLocaleString('es-ES')}"`
      ].join(','))
    ].join('\n');
    
    // Agregar BOM para UTF-8 (Excel)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capturas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.toastService.success('CSV exportado exitosamente');
  }
}
