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
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard Pokémon
        </h1>
        <p class="text-gray-600 text-lg">Resumen del sistema PokeTrainer</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Total Trainers -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ totalTrainers }}</h3>
              <p class="text-gray-600 mt-1">Total Entrenadores</p>
              <div class="flex items-center mt-2">
                <span class="text-sm text-green-600 font-medium">+12%</span>
                <span class="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <app-pokemon-icon type="trainer" size="2xl" class="text-white"></app-pokemon-icon>
            </div>
          </div>
        </div>
        
        <!-- Total Captures -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ totalCaptures }}</h3>
              <p class="text-gray-600 mt-1">Capturas Totales</p>
              <div class="flex items-center mt-2">
                <span class="text-sm text-green-600 font-medium">+8%</span>
                <span class="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <app-pokemon-icon type="pokeball" size="2xl" class="text-white"></app-pokemon-icon>
            </div>
          </div>
        </div>
        
        <!-- Active Trainers -->
        <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-gray-800">{{ activeTrainers }}</h3>
              <p class="text-gray-600 mt-1">Entrenadores Activos</p>
              <div class="flex items-center mt-2">
                <span class="text-sm text-green-600 font-medium">+15%</span>
                <span class="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <app-pokemon-icon type="star" size="2xl" class="text-white"></app-pokemon-icon>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Top Species -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <app-pokemon-icon type="trophy" size="xl" class="text-white"></app-pokemon-icon>
          </div>
          <h3 class="text-2xl font-bold text-gray-800">Top Especies Capturadas</h3>
        </div>
        
        <div class="space-y-4">
          <div *ngFor="let species of topSpecies; let i = index" 
               class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-100">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                <app-pokemon-icon type="pokeball" size="large" class="text-white"></app-pokemon-icon>
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
