import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../core/services/user.service';
import { PokemonIconComponent } from '../shared/components/pokemon-icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, PokemonIconComponent],
  template: `
    <div class="space-y-8 fade-in">
      <!-- Header -->
      <div class="dashboard-header text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard Pokémon
        </h1>
        <p class="text-gray-600 text-lg">Resumen del sistema PokeTrainer</p>
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
                <span class="text-sm text-green-600 font-medium">+12%</span>
                <span class="text-sm text-red-500 ml-1">vs mes anterior</span>
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
                <span class="text-sm text-green-600 font-medium">+8%</span>
                <span class="text-sm text-green-500 ml-1">vs mes anterior</span>
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
                <span class="text-sm text-green-600 font-medium">+15%</span>
                <span class="text-sm text-purple-500 ml-1">vs mes anterior</span>
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
                <h4 class="font-semibold text-gray-800">{{ species.name }}</h4>
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
  topSpecies = [
    { name: 'Pikachu', count: 45 },
    { name: 'Charizard', count: 32 },
    { name: 'Blastoise', count: 28 },
    { name: 'Venusaur', count: 25 },
    { name: 'Mewtwo', count: 12 }
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    const trainers = this.userService.getTrainers();
    this.totalTrainers = trainers.length;
    this.activeTrainers = trainers.filter(t => !t.bannedUntil).length;
    this.totalCaptures = trainers.reduce((sum, t) => sum + t.teamCount, 0);
  }
}
