import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { AdminService, TrainerDetailsResponse } from '../core/services/admin.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-trainer-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  template: `
    <div class="trainer-details-dialog max-w-6xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <mat-icon class="text-white text-3xl">person</mat-icon>
            </div>
            <div *ngIf="!isLoading">
              <h2 class="text-2xl font-bold">{{ data.trainerName }}</h2>
              <p class="text-blue-100">{{ trainerDetails?.trainer?.email }}</p>
            </div>
          </div>
          <button mat-icon-button (click)="close()" class="text-white hover:bg-white hover:bg-opacity-20">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="p-12 text-center">
        <mat-spinner diameter="50" class="mx-auto mb-4"></mat-spinner>
        <p class="text-gray-600">Cargando detalles del entrenador...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="p-6 bg-red-50 border-l-4 border-red-500 m-4">
        <div class="flex items-center space-x-2 text-red-600">
          <mat-icon>error</mat-icon>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && !error && trainerDetails" class="p-6">
        <mat-tab-group>
          <!-- Overview Tab -->
          <mat-tab label="Información">
            <div class="mt-6 space-y-6">
              <!-- Trainer Info Card -->
              <div class="glass-card p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <mat-icon class="mr-2 text-blue-500">info</mat-icon>
                  Información del Entrenador
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Nombre</p>
                    <p class="font-semibold text-gray-800">{{ trainerDetails.trainer.name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <p class="font-semibold text-gray-800">{{ trainerDetails.trainer.email }}</p>
                  </div>
                  <div *ngIf="trainerDetails.trainer.phone">
                    <p class="text-sm text-gray-600">Teléfono</p>
                    <p class="font-semibold text-gray-800">{{ trainerDetails.trainer.phone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Estado</p>
                    <span 
                      class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase"
                      [class.bg-green-100]="trainerDetails.trainer.status === 'activo'"
                      [class.text-green-800]="trainerDetails.trainer.status === 'activo'"
                      [class.bg-red-100]="trainerDetails.trainer.status === 'baneado'"
                      [class.text-red-800]="trainerDetails.trainer.status === 'baneado'"
                      [class.bg-yellow-100]="trainerDetails.trainer.status === 'no_verificado'"
                      [class.text-yellow-800]="trainerDetails.trainer.status === 'no_verificado'">
                      {{ trainerDetails.trainer.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Fecha de Creación</p>
                    <p class="font-semibold text-gray-800">{{ trainerDetails.trainer.createdAt | date:'short' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Última Actualización</p>
                    <p class="font-semibold text-gray-800">{{ trainerDetails.trainer.updatedAt | date:'short' }}</p>
                  </div>
                </div>
              </div>

              <!-- Statistics Card -->
              <div class="glass-card p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <mat-icon class="mr-2 text-purple-500">analytics</mat-icon>
                  Estadísticas
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <mat-icon class="text-blue-500 text-3xl mb-2">people</mat-icon>
                    <p class="text-2xl font-bold text-blue-600">{{ trainerDetails.statistics.teamCount }}</p>
                    <p class="text-sm text-gray-600">Equipo</p>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <mat-icon class="text-green-500 text-3xl mb-2">storage</mat-icon>
                    <p class="text-2xl font-bold text-green-600">{{ trainerDetails.statistics.pcCount }}</p>
                    <p class="text-sm text-gray-600">PC</p>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <mat-icon class="text-purple-500 text-3xl mb-2">pets</mat-icon>
                    <p class="text-2xl font-bold text-purple-600">{{ trainerDetails.statistics.totalPokemon }}</p>
                    <p class="text-sm text-gray-600">Total Pokémon</p>
                  </div>
                  <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <mat-icon class="text-orange-500 text-3xl mb-2">catching_pokemon</mat-icon>
                    <p class="text-2xl font-bold text-orange-600">{{ trainerDetails.statistics.totalCaptures }}</p>
                    <p class="text-sm text-gray-600">Capturas</p>
                  </div>
                </div>

                <!-- Rarity Distribution -->
                <div class="mt-6">
                  <h4 class="text-lg font-semibold text-gray-800 mb-3">Distribución por Rareza</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="p-3 bg-gray-100 rounded-lg">
                      <p class="text-sm text-gray-600">Común</p>
                      <p class="text-xl font-bold text-gray-800">{{ trainerDetails.statistics.capturesByRarity.common }}</p>
                    </div>
                    <div class="p-3 bg-blue-100 rounded-lg">
                      <p class="text-sm text-gray-600">Raro</p>
                      <p class="text-xl font-bold text-blue-800">{{ trainerDetails.statistics.capturesByRarity.rare }}</p>
                    </div>
                    <div class="p-3 bg-purple-100 rounded-lg">
                      <p class="text-sm text-gray-600">Épico</p>
                      <p class="text-xl font-bold text-purple-800">{{ trainerDetails.statistics.capturesByRarity.epic }}</p>
                    </div>
                    <div class="p-3 bg-yellow-100 rounded-lg">
                      <p class="text-sm text-gray-600">Legendario</p>
                      <p class="text-xl font-bold text-yellow-800">{{ trainerDetails.statistics.capturesByRarity.legend }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Team Tab -->
          <mat-tab label="Equipo">
            <div class="mt-6">
              <div class="mb-4">
                <p class="text-gray-600">Equipo: {{ trainerDetails.team.length }}/6</p>
              </div>
              <div *ngIf="trainerDetails.team.length === 0" class="text-center py-12 text-gray-500">
                <mat-icon class="text-6xl mb-4">inbox</mat-icon>
                <p class="text-lg font-semibold">El equipo está vacío</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let pokemon of trainerDetails.team" class="glass-card p-4 hover:scale-105 transition-transform">
                  <div class="flex items-center space-x-4">
                    <img 
                      [src]="pokemon.pokemon.spriteUrl || 'https://via.placeholder.com/64'" 
                      [alt]="pokemon.pokemon.name"
                      class="w-16 h-16 object-contain">
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-800 capitalize">{{ pokemon.nickname || pokemon.pokemon.name }}</h4>
                      <p class="text-sm text-gray-600">Nivel {{ pokemon.level }}</p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span *ngFor="let type of pokemon.pokemon.types" 
                              class="px-2 py-1 text-xs bg-gray-200 rounded capitalize">
                          {{ type }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- PC Tab -->
          <mat-tab label="PC">
            <div class="mt-6 space-y-6">
              <div class="mb-4">
                <p class="text-gray-600">Total en PC: {{ trainerDetails.statistics.pcCount }} Pokémon</p>
              </div>
              <mat-tab-group>
                <mat-tab [label]="'Caja 1 (' + trainerDetails.pc.counts.box1 + ')'">
                  <div class="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div *ngFor="let pokemon of trainerDetails.pc.box1" class="glass-card p-3">
                      <img 
                        [src]="pokemon.pokemon.spriteUrl || 'https://via.placeholder.com/64'" 
                        [alt]="pokemon.pokemon.name"
                        class="w-12 h-12 mx-auto mb-2">
                      <p class="text-sm font-semibold text-center capitalize">{{ pokemon.pokemon.name }}</p>
                      <p class="text-xs text-gray-600 text-center">Nivel {{ pokemon.level }}</p>
                    </div>
                  </div>
                </mat-tab>
                <mat-tab [label]="'Caja 2 (' + trainerDetails.pc.counts.box2 + ')'">
                  <div class="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div *ngFor="let pokemon of trainerDetails.pc.box2" class="glass-card p-3">
                      <img 
                        [src]="pokemon.pokemon.spriteUrl || 'https://via.placeholder.com/64'" 
                        [alt]="pokemon.pokemon.name"
                        class="w-12 h-12 mx-auto mb-2">
                      <p class="text-sm font-semibold text-center capitalize">{{ pokemon.pokemon.name }}</p>
                      <p class="text-xs text-gray-600 text-center">Nivel {{ pokemon.level }}</p>
                    </div>
                  </div>
                </mat-tab>
                <mat-tab [label]="'Caja 3 (' + trainerDetails.pc.counts.box3 + ')'">
                  <div class="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div *ngFor="let pokemon of trainerDetails.pc.box3" class="glass-card p-3">
                      <img 
                        [src]="pokemon.pokemon.spriteUrl || 'https://via.placeholder.com/64'" 
                        [alt]="pokemon.pokemon.name"
                        class="w-12 h-12 mx-auto mb-2">
                      <p class="text-sm font-semibold text-center capitalize">{{ pokemon.pokemon.name }}</p>
                      <p class="text-xs text-gray-600 text-center">Nivel {{ pokemon.level }}</p>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </div>
          </mat-tab>

          <!-- Captures Tab -->
          <mat-tab label="Capturas">
            <div class="mt-6">
              <div class="mb-4 flex justify-between items-center">
                <p class="text-gray-600">Total de capturas: {{ trainerDetails.captures.meta.total }}</p>
              </div>
              <div *ngIf="trainerDetails.captures.data.length === 0" class="text-center py-12 text-gray-500">
                <mat-icon class="text-6xl mb-4">inbox</mat-icon>
                <p class="text-lg font-semibold">No hay capturas registradas</p>
              </div>
              <div class="space-y-3">
                <div *ngFor="let capture of trainerDetails.captures.data" class="glass-card p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <img 
                        [src]="capture.pokemon.spriteUrl || 'https://via.placeholder.com/64'" 
                        [alt]="capture.pokemon.name"
                        class="w-12 h-12 object-contain">
                      <div>
                        <h4 class="font-bold text-gray-800 capitalize">{{ capture.pokemon.name }}</h4>
                        <p class="text-sm text-gray-600">{{ capture.formattedDate?.full || (capture.capturedAt | date:'short') }}</p>
                      </div>
                    </div>
                    <span 
                      class="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                      [class.rarity-common]="capture.rarity === 'common'"
                      [class.rarity-rare]="capture.rarity === 'rare'"
                      [class.rarity-epic]="capture.rarity === 'epic'"
                      [class.rarity-legend]="capture.rarity === 'legend'">
                      {{ capture.rarity }}
                    </span>
                  </div>
                </div>
              </div>
              <mat-paginator 
                *ngIf="trainerDetails.captures.meta.total > 0"
                [length]="trainerDetails.captures.meta.total"
                [pageSize]="trainerDetails.captures.meta.perPage"
                [pageIndex]="trainerDetails.captures.meta.currentPage - 1"
                [pageSizeOptions]="[10, 20, 50]"
                (page)="onPageChange($event)"
                showFirstLastButtons
                class="mt-4">
              </mat-paginator>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .trainer-details-dialog {
      width: 100%;
    }
    
    ::ng-deep .mat-mdc-dialog-container {
      padding: 0 !important;
      max-width: 90vw !important;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      min-height: 400px;
    }
  `]
})
export class TrainerDetailsDialogComponent implements OnInit {
  trainerDetails: TrainerDetailsResponse | null = null;
  isLoading = true;
  error: string | null = null;
  currentCapturePage = 1;
  capturePerPage = 20;

  constructor(
    public dialogRef: MatDialogRef<TrainerDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { trainerId: number; trainerName: string },
    private adminService: AdminService
  ) {}

  async ngOnInit() {
    await this.loadTrainerDetails();
  }

  async loadTrainerDetails() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await firstValueFrom(
        this.adminService.getTrainerDetails(this.data.trainerId, {
          capturePage: this.currentCapturePage,
          capturePerPage: this.capturePerPage
        })
      );
      this.trainerDetails = response;
    } catch (error: any) {
      console.error('Error loading trainer details:', error);
      this.error = error?.error?.message || 'Error al cargar los detalles del entrenador';
    } finally {
      this.isLoading = false;
    }
  }

  async onPageChange(event: PageEvent) {
    this.currentCapturePage = event.pageIndex + 1;
    this.capturePerPage = event.pageSize;
    await this.loadTrainerDetails();
  }

  close() {
    this.dialogRef.close();
  }
}

