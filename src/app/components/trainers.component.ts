import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastService } from '../core/services/toast.service';
import { TrainerDetailsDialogComponent } from './trainer-details-dialog.component';
import { AdminService, Trainer } from '../core/services/admin.service';

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
    MatCardModule,
    MatDialogModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule
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
        <!-- Search and Filter Row -->
        <div class="flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-6">
          <div class="flex-1 min-w-0">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Buscar entrenador</mat-label>
              <input 
                matInput 
                (keyup)="onSearchChange($event)" 
                placeholder="Nombre o email" 
                class="text-gray-800"
                [value]="searchTerm">
              <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
            </mat-form-field>
          </div>
          
          <div class="flex items-center gap-4 flex-shrink-0">
            <mat-form-field appearance="outline" class="w-full md:w-40">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onStatusChange()">
                <mat-option value="all">Todos</mat-option>
                <mat-option value="active">Activos</mat-option>
                <mat-option value="banned">Baneados</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
        
        <!-- Stats Row -->
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-8 mb-6 pb-6 border-b border-gray-200">
          <div class="flex flex-col items-center px-4 py-2 rounded-lg bg-gray-50 min-w-[100px]">
            <p class="text-3xl md:text-4xl font-bold text-gray-800">{{ totalItems }}</p>
            <p class="text-xs md:text-sm text-gray-600 font-medium uppercase tracking-wide">Total</p>
          </div>
          <div class="flex flex-col items-center px-4 py-2 rounded-lg bg-green-50 min-w-[100px]">
            <p class="text-3xl md:text-4xl font-bold text-green-600">{{ activeTrainers }}</p>
            <p class="text-xs md:text-sm text-gray-600 font-medium uppercase tracking-wide">Activos</p>
          </div>
        </div>
        
        <!-- Loading Indicator -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        
        <!-- Error Message -->
        <div *ngIf="error && !isLoading" class="p-4 bg-red-50 border-l-4 border-red-500 mb-4">
          <div class="flex items-center space-x-2 text-red-600">
            <mat-icon>error</mat-icon>
            <span>{{ error || 'Error desconocido' }}</span>
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
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                  [class.bg-green-100]="!trainer.isBanned"
                  [class.text-green-800]="!trainer.isBanned"
                  [class.bg-red-100]="trainer.isBanned"
                  [class.text-red-800]="trainer.isBanned"
                >
                  {{ trainer.isBanned ? 'Baneado' : 'Activo' }}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-gray-700 font-semibold">Acciones</th>
              <td mat-cell *matCellDef="let trainer" class="py-4 relative">
                <button mat-icon-button [matMenuTriggerFor]="menu" 
                        class="bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200">
                  <mat-icon class="text-gray-600">more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu" 
                         class="custom-menu"
                         xPosition="before"
                         yPosition="below"
                         [overlapTrigger]="true">
                  <button mat-menu-item (click)="viewTrainer(trainer)" class="menu-item">
                    <mat-icon class="text-blue-500">visibility</mat-icon>
                    <span class="ml-2">Ver</span>
                  </button>
                  <button mat-menu-item (click)="toggleBanStatus(trainer)" class="menu-item">
                    <mat-icon [class.text-red-500]="!trainer.isBanned" [class.text-green-500]="trainer.isBanned">
                      {{ trainer.isBanned ? 'check_circle' : 'block' }}
                    </mat-icon>
                    <span class="ml-2">{{ trainer.isBanned ? 'Desbanear' : 'Banear' }}</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns" class="border-b-2 border-gray-200"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors duration-200"></tr>
          </table>
        </div>
        
        <mat-paginator 
          *ngIf="!isLoading && totalItems > 0"
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageIndex]="currentPage - 1"
          [pageSizeOptions]="[5, 10, 15, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons 
          class="mt-4">
        </mat-paginator>
        
        <!-- Empty State -->
        <div *ngIf="!isLoading && totalItems === 0" class="text-center py-12 text-gray-500">
          <mat-icon class="text-6xl mb-4">inbox</mat-icon>
          <p class="text-lg font-semibold">No se encontraron entrenadores</p>
          <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos para el menú desplegable */
    ::ng-deep .custom-menu {
      border-radius: 12px !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      overflow: hidden !important;
      margin-top: 4px !important;
      min-width: 160px !important;
    }

    ::ng-deep .custom-menu .mat-mdc-menu-content {
      padding: 8px !important;
    }

    /* Animación de entrada del panel del menú */
    ::ng-deep .cdk-overlay-pane[data-panel] {
      animation: menuFadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    @keyframes menuFadeInDown {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Animación de salida */
    ::ng-deep .cdk-overlay-pane[data-panel].cdk-overlay-backdrop-showing {
      animation: menuFadeOut 0.15s cubic-bezier(0.4, 0, 1, 1) forwards !important;
    }

    @keyframes menuFadeOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
    }

    /* Estilos para los items del menú */
    ::ng-deep .menu-item {
      padding: 10px 16px !important;
      display: flex !important;
      align-items: center !important;
      transition: all 0.2s ease !important;
      border-radius: 8px !important;
      margin: 2px 0 !important;
      width: calc(100% - 4px) !important;
    }

    ::ng-deep .menu-item:hover {
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb) !important;
      transform: translateX(4px) !important;
    }

    ::ng-deep .menu-item mat-icon {
      margin-right: 12px !important;
      width: 20px !important;
      height: 20px !important;
      font-size: 20px !important;
    }

    /* Mejorar el backdrop del menú */
    ::ng-deep .cdk-overlay-backdrop {
      background-color: rgba(0, 0, 0, 0.04) !important;
      backdrop-filter: blur(2px);
      animation: backdropFadeIn 0.2s ease-out !important;
    }

    ::ng-deep .cdk-overlay-backdrop.cdk-overlay-backdrop-showing {
      animation: backdropFadeOut 0.15s ease-out forwards !important;
    }

    @keyframes backdropFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes backdropFadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    /* Asegurar que el menú se cierre al hacer click fuera */
    ::ng-deep .cdk-overlay-backdrop.cdk-overlay-backdrop-showing {
      cursor: pointer !important;
    }

    /* Mejorar el z-index para que el menú esté por encima */
    ::ng-deep .cdk-overlay-container {
      z-index: 1000 !important;
    }

    ::ng-deep .cdk-overlay-pane {
      z-index: 1001 !important;
    }
  `]
})
export class TrainersComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['name', 'teamCount', 'status', 'actions'];
  dataSource = new MatTableDataSource<Trainer>();
  activeTrainers = 0;
  totalItems = 0;
  currentPage = 1;
  pageSize = 15;
  searchTerm = '';
  statusFilter: 'active' | 'banned' | 'all' = 'all';
  isLoading = false;
  error: string | null = null;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private toastService: ToastService,
    private dialog: MatDialog,
    private adminService: AdminService
  ) {
    // Configurar debounce para búsqueda
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadTrainers();
    });
  }

  ngOnInit() {
    this.loadTrainers();
  }

  ngAfterViewInit() {
    // No configurar paginator en dataSource porque usamos paginación del servidor
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    this.searchSubject.next(value);
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadTrainers();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.isLoading = true;
    this.error = null;

    this.adminService.getAllTrainers({
      page: this.currentPage,
      perPage: this.pageSize,
      search: this.searchTerm || undefined,
      status: this.statusFilter
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.totalItems = response.meta.total;
        this.currentPage = response.meta.currentPage || this.currentPage;
        this.pageSize = response.meta.perPage || this.pageSize;
        
        // Calcular entrenadores activos
        this.activeTrainers = response.data.filter(t => !t.isBanned).length;
        
        // Actualizar paginator si existe
        if (this.paginator) {
          setTimeout(() => {
            this.paginator.length = this.totalItems;
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
          }, 100);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Error al cargar los entrenadores';
        this.error = errorMessage;
        this.isLoading = false;
        this.toastService.error(errorMessage);
      }
    });
  }

  viewTrainer(trainer: Trainer) {
    const dialogRef = this.dialog.open(TrainerDetailsDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: {
        trainerId: trainer.id,
        trainerName: trainer.name
      },
      panelClass: 'trainer-details-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Recargar datos después de cerrar el dialog
      this.loadTrainers();
    });
  }

  toggleBanStatus(trainer: Trainer) {
    const action = trainer.isBanned ? 'desbanear' : 'banear';
    const actionPast = trainer.isBanned ? 'desbaneado' : 'baneado';
    
    this.adminService.banTrainer(trainer.id, !trainer.isBanned)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toastService.success(`${trainer.name} ${actionPast} exitosamente`);
          this.loadTrainers(); // Recargar lista
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Error desconocido';
          this.toastService.error(`Error al ${action} al entrenador: ${errorMessage}`);
        }
      });
  }
}
