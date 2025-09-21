import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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
import { Capture, RarityType } from '../core/models/capture';
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <mat-form-field appearance="outline">
            <mat-label>Buscar</mat-label>
            <input matInput (keyup)="applyFilter()" [(ngModel)]="searchTerm" placeholder="Entrenador o especie" class="text-gray-800">
            <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Especie</mat-label>
            <mat-select [(ngModel)]="speciesFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let species of species" [value]="species">{{ species }}</mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Rareza</mat-label>
            <mat-select [(ngModel)]="rarityFilter" (selectionChange)="applyFilter()">
              <mat-option value="">Todas</mat-option>
              <mat-option *ngFor="let rarity of rarities" [value]="rarity">{{ rarity }}</mat-option>
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
                  <span class="font-semibold text-gray-800">{{ capture.trainerName }}</span>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="species">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Especie</th>
              <td mat-cell *matCellDef="let capture" class="py-4">
                <div class="flex items-center space-x-2">
                  <mat-icon class="text-yellow-500">pets</mat-icon>
                  <span class="font-semibold text-gray-800">{{ capture.species }}</span>
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
                  <span class="text-gray-800">{{ capture.date | date:'short' }}</span>
                </div>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="border-b-2 border-gray-200"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors duration-200"></tr>
          </table>
        </div>
        
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons class="mt-4"></mat-paginator>
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
  
  species = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mewtwo', 'Dragonite', 'Snorlax'];
  rarities: RarityType[] = ['common', 'rare', 'epic', 'legend'];
  
  private mockCaptures: Capture[] = [
    { id: '1', trainerName: 'Ash Ketchum', species: 'Pikachu', rarity: 'common', date: '2024-01-15T10:30:00Z' },
    { id: '2', trainerName: 'Misty Waterflower', species: 'Charizard', rarity: 'rare', date: '2024-01-14T15:45:00Z' },
    { id: '3', trainerName: 'Brock Harrison', species: 'Blastoise', rarity: 'epic', date: '2024-01-13T09:20:00Z' },
    { id: '4', trainerName: 'Gary Oak', species: 'Mewtwo', rarity: 'legend', date: '2024-01-12T14:10:00Z' },
    { id: '5', trainerName: 'Serena Yvonne', species: 'Dragonite', rarity: 'rare', date: '2024-01-11T11:55:00Z' },
  ];

  ngOnInit() {
    this.dataSource.data = this.mockCaptures;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.initializeFlatpickr();
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
          this.dateFilter = selectedDates.length > 0 ? selectedDates[0] : null;
          this.applyFilter();
        },
        allowInput: false,
        clickOpens: true,
        static: true,
        position: 'auto center'
      });
    }
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }

  applyFilter(): void {
    let filteredData: Capture[] = [...this.mockCaptures];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter((capture: Capture) => 
        capture.trainerName.toLowerCase().includes(term) ||
        capture.species.toLowerCase().includes(term)
      );
    }
    
    if (this.speciesFilter) {
      filteredData = filteredData.filter((capture: Capture) => capture.species === this.speciesFilter);
    }
    
    if (this.rarityFilter) {
      filteredData = filteredData.filter((capture: Capture) => capture.rarity === this.rarityFilter);
    }
    
    if (this.dateFilter) {
      const filterDate = this.dateFilter.toISOString().split('T')[0];
      filteredData = filteredData.filter((capture: Capture) => 
        capture.date.split('T')[0] === filterDate
      );
    }
    
    this.dataSource.data = filteredData;
  }

  exportCSV() {
    const headers = ['Entrenador', 'Especie', 'Rareza', 'Fecha'];
    const csvContent = [
      headers.join(','),
      ...this.dataSource.data.map(capture => [
        capture.trainerName,
        capture.species,
        capture.rarity,
        new Date(capture.date).toLocaleDateString()
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
