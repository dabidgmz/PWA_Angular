import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RarityType } from '../core/models/capture';
import { AdminService, Capture } from '../core/services/admin.service';
import flatpickr from 'flatpickr';

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
    MatCardModule
  ],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="text-center md:text-left mb-4 md:mb-0">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Capturas Pokémon
          </h1>
          <p class="text-gray-600 text-lg">Historial de capturas del sistema</p>
        </div>
        <button mat-raised-button class="pokemon-btn" (click)="exportCSV()">
          <mat-icon class="mr-2">download</mat-icon>
          Exportar CSV
        </button>
      </div>
      
      <!-- Filters -->
      <div class="glass-card p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Filtros de Búsqueda</h3>
          <button 
            *ngIf="searchTerm || speciesFilter || rarityFilter || dateFilter"
            mat-button 
            (click)="clearFilters()"
            class="text-sm text-red-600">
            <mat-icon class="text-sm mr-1">clear</mat-icon>
            Limpiar Filtros
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-form-field appearance="outline">
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
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Especie</mat-label>
            <mat-select [(ngModel)]="speciesFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let species of species" [value]="species">
                <span class="capitalize">{{ species }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Rareza</mat-label>
            <mat-select [(ngModel)]="rarityFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let rarity of rarities" [value]="rarity">
                <span class="capitalize">{{ rarity === 'legend' ? 'Legendario' : (rarity === 'common' ? 'Común' : (rarity === 'rare' ? 'Raro' : 'Épico')) }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input #dateInput matInput placeholder="Seleccionar fecha" readonly>
          </mat-form-field>
        </div>
        
        <!-- Captures Table -->
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="trainerName">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Entrenador</th>
              <td mat-cell *matCellDef="let capture" class="py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <mat-icon class="text-white text-sm">person</mat-icon>
                  </div>
                  <span class="font-semibold text-gray-800">{{ capture.trainer.name }}</span>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="species">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Especie</th>
              <td mat-cell *matCellDef="let capture" class="py-4">
                <div class="flex items-center space-x-2">
                  <mat-icon class="text-yellow-500">pets</mat-icon>
                  <span class="font-semibold text-gray-800 capitalize">{{ capture.pokemon.name }}</span>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="rarity">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Rareza</th>
              <td mat-cell *matCellDef="let capture" class="py-4">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                  [class.rarity-common]="capture.rarity === 'common'"
                  [class.rarity-rare]="capture.rarity === 'rare'"
                  [class.rarity-epic]="capture.rarity === 'epic'"
                  [class.rarity-legend]="capture.rarity === 'legend'"
                >
                  {{ capture.rarity }}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Fecha</th>
              <td mat-cell *matCellDef="let capture" class="py-4">
                <div class="flex items-center space-x-2">
                  <mat-icon class="text-gray-400">schedule</mat-icon>
                  <span class="text-gray-800">{{ capture.formattedDate?.full || (capture.capturedAt | date:'short') }}</span>
                </div>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="border-b-2 border-gray-200"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors duration-200"></tr>
          </table>
        </div>
        
        <div *ngIf="totalItems > 0" class="mt-4">
          <mat-paginator 
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageIndex]="currentPage - 1"
            showFirstLastButtons>
          </mat-paginator>
          <div class="text-sm text-gray-600 text-center mt-2">
            Mostrando {{ getDisplayRange().start }} - {{ getDisplayRange().end }} de {{ totalItems }} capturas
          </div>
        </div>
        
        <div *ngIf="!isLoading && totalItems === 0" class="text-center py-12 text-gray-500">
          <mat-icon class="text-6xl mb-4">inbox</mat-icon>
          <p class="text-lg font-semibold">No se encontraron capturas</p>
          <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    </div>
  `
})
export class CapturesComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['trainerName', 'species', 'rarity', 'date'];
  dataSource = new MatTableDataSource<Capture>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef;
  
  private flatpickrInstance: flatpickr.Instance | null = null;
  
  searchTerm = '';
  speciesFilter = '';
  rarityFilter = '';
  dateFilter: Date | null = null;
  currentPage = 1;
  totalItems = 0;
  pageSize = 50;
  
  species: string[] = [];
  rarities: RarityType[] = ['common', 'rare', 'epic', 'legend'];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadCaptures();
  }
  
  loadCaptures() {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      perPage: this.pageSize
    };
    
    // Si hay búsqueda de texto, incluirla
    if (this.searchTerm && this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }
    
    // Filtrar por especie - usar búsqueda por nombre
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
    
    // Filtrar por rareza
    if (this.rarityFilter && this.rarityFilter !== '') {
      // El backend podría usar "legendary" en lugar de "legend"
      // Pero según el README, usa 'common', 'rare', 'epic', 'legend'
      params.rarity = this.rarityFilter;
    }
    
    // Filtrar por fecha
    if (this.dateFilter) {
      const dateStr = this.dateFilter.toISOString().split('T')[0];
      params.dateFrom = dateStr;
      params.dateTo = dateStr;
    }
    
    this.adminService.getCaptureHistory(params).subscribe({
      next: (response) => {
        console.log('Captures response:', response);
        this.dataSource.data = response.data;
        this.totalItems = response.meta.total;
        this.currentPage = response.meta.currentPage || this.currentPage;
        this.pageSize = response.meta.perPage || this.pageSize;
        
        // Actualizar el paginator después de recibir los datos
        // Usar setTimeout para asegurar que el paginator esté inicializado
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.length = this.totalItems;
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
            console.log('Paginator updated:', {
              length: this.paginator.length,
              pageIndex: this.paginator.pageIndex,
              pageSize: this.paginator.pageSize
            });
          }
        }, 100);
        
        // Extraer especies únicas de TODOS los resultados para el filtro
        // Esto requiere cargar todas las especies disponibles (mejor hacerlo en un endpoint separado)
        // Por ahora, solo usamos las especies de los datos actuales
        const uniqueSpecies = new Set<string>();
        response.data.forEach(capture => {
          uniqueSpecies.add(capture.pokemon.name);
        });
        // Mantener especies existentes y agregar nuevas
        this.species = Array.from(new Set([...this.species, ...Array.from(uniqueSpecies)])).sort();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading captures:', error);
        this.isLoading = false;
        // Fallback a datos demo
        this.loadDemoData();
      }
    });
  }
  
  private loadDemoData() {
    const mockCaptures: Capture[] = [
      {
        id: 1,
        trainer: { id: 1, name: 'Ash Ketchum', email: 'ash@pokemon.com' },
        pokemon: { id: 25, pokeapiId: 25, name: 'pikachu' },
        rarity: 'common',
        capturedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        trainer: { id: 2, name: 'Misty Waterflower', email: 'misty@pokemon.com' },
        pokemon: { id: 6, pokeapiId: 6, name: 'charizard' },
        rarity: 'rare',
        capturedAt: '2024-01-14T15:45:00Z'
      }
    ];
    this.dataSource.data = mockCaptures;
  }

  ngAfterViewInit() {
    // NO configurar paginator en dataSource porque usamos paginación del servidor
    this.initializeFlatpickr();
    
    // Escuchar cambios de página
    if (this.paginator) {
      // Configurar valores iniciales
      this.paginator.pageSize = this.pageSize;
      this.paginator.pageIndex = this.currentPage - 1;
      
      // Suscribirse a cambios de página
      this.paginator.page
        .pipe(takeUntil(this.destroy$))
        .subscribe((event) => {
          this.currentPage = event.pageIndex + 1;
          this.pageSize = event.pageSize;
          this.loadCaptures();
        });
    }
  }

  private initializeFlatpickr() {
    if (this.dateInput) {
      this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
        dateFormat: 'd/m/Y',
        altInput: true,
        altFormat: 'd/m/Y',
        locale: {
          firstDayOfWeek: 1,
          weekdays: {
            shorthand: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
          },
          months: {
            shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          }
        },
        onChange: (selectedDates, dateStr) => {
          if (selectedDates.length > 0) {
            this.dateFilter = selectedDates[0];
          } else {
            this.dateFilter = null;
          }
          this.currentPage = 1;
          this.loadCaptures();
        },
        allowInput: false,
        clickOpens: true,
        static: true,
        position: 'auto center'
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
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
    
    // Limpiar el datepicker
    if (this.flatpickrInstance) {
      this.flatpickrInstance.clear();
    }
    
    this.applyFilter();
  }
  
  getDisplayRange(): { start: number; end: number } {
    const start = this.totalItems > 0 ? ((this.currentPage - 1) * this.pageSize) + 1 : 0;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return { start, end };
  }

  exportCSV() {
    const headers = ['Entrenador', 'Especie', 'Rareza', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...this.dataSource.data.map(capture => [
        capture.trainer.name,
        capture.pokemon.name,
        capture.rarity,
        capture.formattedDate?.full || new Date(capture.capturedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capturas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
