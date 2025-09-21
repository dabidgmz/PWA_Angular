import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PokemonIconsService {

  private pokemonIcons: { [key: string]: string } = {
    // Pokémon principales
    'pikachu': '⚡',
    'charizard': '🔥',
    'blastoise': '💧',
    'venusaur': '🌿',
    'mewtwo': '🧠',
    'dragonite': '🐉',
    'snorlax': '😴',
    
    // Iconos de sistema
    'dashboard': '⚡',
    'trainers': '👥',
    'captures': '🎣',
    'qr-manager': '📱',
    'settings': '⚙️',
    'pokeball': '⚪',
    'greatball': '🔵',
    'ultraball': '🟡',
    'masterball': '🟣',
    
    // Tipos Pokémon
    'fire': '🔥',
    'water': '💧',
    'grass': '🌿',
    'electric': '⚡',
    'psychic': '🧠',
    'ice': '❄️',
    'dragon': '🐉',
    'dark': '🌙',
    'fairy': '✨',
    'fighting': '👊',
    'poison': '☠️',
    'ground': '🏔️',
    'flying': '🕊️',
    'bug': '🐛',
    'rock': '🪨',
    'ghost': '👻',
    'steel': '⚙️',
    'normal': '⚪',
    
    // Acciones
    'catch': '🎣',
    'battle': '⚔️',
    'train': '💪',
    'evolve': '🌟',
    'heal': '💚',
    'save': '💾',
    'export': '📤',
    'import': '📥',
    'search': '🔍',
    'filter': '🔧',
    'add': '➕',
    'remove': '➖',
    'edit': '✏️',
    'delete': '🗑️',
    'view': '👁️',
    'star': '⭐',
    'trophy': '🏆',
    'medal': '🥇',
    'badge': '🎖️',
    
    // Estados
    'active': '✅',
    'inactive': '❌',
    'banned': '🚫',
    'online': '🟢',
    'offline': '🔴',
    'pending': '⏳',
    'completed': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'success': '✅',
    
    // Navegación
    'home': '🏠',
    'back': '⬅️',
    'forward': '➡️',
    'up': '⬆️',
    'down': '⬇️',
    'menu': '☰',
    'close': '❌',
    'expand': '📖',
    'collapse': '📕',
    
    // Profesor Oak específicos
    'professor-oak': '👨‍🔬',
    'lab': '🧪',
    'research': '🔬',
    'data': '📊',
    'analysis': '📈',
    'report': '📋',
    'study': '📚',
    'experiment': '⚗️'
  };

  getIcon(key: string): string {
    return this.pokemonIcons[key.toLowerCase()] || '❓';
  }

  getPokemonIcon(species: string): string {
    const cleanSpecies = species.toLowerCase().replace(/\s+/g, '-');
    return this.pokemonIcons[cleanSpecies] || this.pokemonIcons['pokeball'];
  }

  getTypeIcon(type: string): string {
    return this.pokemonIcons[type.toLowerCase()] || '⚪';
  }

  getActionIcon(action: string): string {
    return this.pokemonIcons[action.toLowerCase()] || '⚡';
  }

  getStatusIcon(status: string): string {
    return this.pokemonIcons[status.toLowerCase()] || '⚪';
  }

  getAllIcons(): { [key: string]: string } {
    return { ...this.pokemonIcons };
  }
}
