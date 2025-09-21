import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../core/services/user.service';
import { ToastService } from '../core/services/toast.service';
import { Trainer } from '../core/models/trainer';

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule
  ],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Entrenadores Pokémon
        </h1>
        <p class="text-gray-600 text-lg">Gestiona los entrenadores del sistema</p>
      </div>
      
      <!-- Search and Stats -->
      <div class="glass-card p-6">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div class="w-full md:w-96">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Buscar entrenador</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nombre o email" class="text-gray-800">
              <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
            </mat-form-field>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ dataSource.data.length }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">Total</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ activeTrainers }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">Activos</p>
            </div>
          </div>
        </div>
        
        <!-- Trainers Table -->
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Entrenador</th>
              <td mat-cell *matCellDef="let trainer" class="py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <mat-icon class="text-white text-sm">person</mat-icon>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ trainer.name }}</p>
                    <p class="text-sm text-gray-600">{{ trainer.email }}</p>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="teamCount">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Equipo</th>
              <td mat-cell *matCellDef="let trainer" class="py-4">
                <div class="flex items-center space-x-2">
                  <mat-icon class="text-yellow-500">pets</mat-icon>
                  <span class="font-semibold text-gray-800">{{ trainer.teamCount }}</span>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Estado</th>
              <td mat-cell *matCellDef="let trainer" class="py-4">
                <span 
                  class="status-badge"
                  [class.status-active]="!trainer.bannedUntil"
                  [class.status-banned]="trainer.bannedUntil"
                >
                  {{ trainer.bannedUntil ? 'Baneado' : 'Activo' }}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Acciones</th>
              <td mat-cell *matCellDef="let trainer" class="py-4">
                <button mat-icon-button [matMenuTriggerFor]="menu" class="bg-gray-100 hover:bg-gray-200 rounded-full">
                  <mat-icon class="text-gray-600">more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu" class="rounded-xl">
                  <button mat-menu-item (click)="viewTrainer(trainer)" class="rounded-lg">
                    <mat-icon class="text-blue-500">visibility</mat-icon>
                    <span class="ml-2">Ver</span>
                  </button>
                  <button mat-menu-item (click)="resetTrainer(trainer)" class="rounded-lg">
                    <mat-icon class="text-yellow-500">refresh</mat-icon>
                    <span class="ml-2">Reset</span>
                  </button>
                  <button mat-menu-item (click)="banTrainer(trainer)" class="rounded-lg">
                    <mat-icon class="text-red-500">block</mat-icon>
                    <span class="ml-2">Banear</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="border-b-2 border-gray-200"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors duration-200"></tr>
          </table>
        </div>
        
        <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons class="mt-4"></mat-paginator>
      </div>
    </div>
  `
})
export class TrainersComponent implements OnInit {
  displayedColumns: string[] = ['name', 'teamCount', 'status', 'actions'];
  dataSource = new MatTableDataSource<Trainer>();
  activeTrainers = 0;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const trainers = this.userService.getTrainers();
    this.dataSource.data = trainers;
    this.activeTrainers = trainers.filter(t => !t.bannedUntil).length;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewTrainer(trainer: Trainer) {
    this.toastService.info(`Viendo detalles de ${trainer.name}`);
  }

  resetTrainer(trainer: Trainer) {
    this.userService.resetTrainer(trainer.id);
    this.toastService.success(`Equipo de ${trainer.name} reseteado`);
    this.refreshData();
  }

  banTrainer(trainer: Trainer) {
    this.userService.banTrainer(trainer.id, 7);
    this.toastService.success(`${trainer.name} baneado por 7 días`);
    this.refreshData();
  }

  private refreshData() {
    const trainers = this.userService.getTrainers();
    this.dataSource.data = trainers;
  }
}
