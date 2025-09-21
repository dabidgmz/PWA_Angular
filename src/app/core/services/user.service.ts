import { Injectable } from '@angular/core';
import { Trainer } from '../models/trainer';
import { storage } from '../utils/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly TRAINERS_KEY = 'pokemon_trainers';

  constructor() {
    this.initializeDefaultTrainers();
  }

  getTrainers(): Trainer[] {
    const trainers = storage.get<Trainer[]>(this.TRAINERS_KEY) || [];
    return trainers.map(trainer => ({
      ...trainer,
      createdAt: new Date(trainer.createdAt),
      bannedUntil: trainer.bannedUntil ? new Date(trainer.bannedUntil) : undefined
    }));
  }

  getTrainer(id: string): Trainer | undefined {
    const trainers = this.getTrainers();
    return trainers.find(trainer => trainer.id === id);
  }

  addTrainer(trainer: Omit<Trainer, 'id' | 'createdAt'>): Trainer {
    const trainers = this.getTrainers();
    const newTrainer: Trainer = {
      ...trainer,
      id: this.generateId(),
      createdAt: new Date()
    };
    trainers.push(newTrainer);
    storage.set(this.TRAINERS_KEY, trainers);
    return newTrainer;
  }

  updateTrainer(id: string, updates: Partial<Trainer>): Trainer | null {
    const trainers = this.getTrainers();
    const index = trainers.findIndex(trainer => trainer.id === id);
    if (index !== -1) {
      trainers[index] = { ...trainers[index], ...updates };
      storage.set(this.TRAINERS_KEY, trainers);
      return trainers[index];
    }
    return null;
  }

  deleteTrainer(id: string): boolean {
    const trainers = this.getTrainers();
    const filteredTrainers = trainers.filter(trainer => trainer.id !== id);
    if (filteredTrainers.length !== trainers.length) {
      storage.set(this.TRAINERS_KEY, filteredTrainers);
      return true;
    }
    return false;
  }

  banTrainer(id: string, days: number): boolean {
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + days);
    return this.updateTrainer(id, { bannedUntil }) !== null;
  }

  unbanTrainer(id: string): boolean {
    return this.updateTrainer(id, { bannedUntil: undefined }) !== null;
  }

  resetTrainer(id: string): boolean {
    return this.updateTrainer(id, { teamCount: 0 }) !== null;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeDefaultTrainers(): void {
    const existingTrainers = storage.get<Trainer[]>(this.TRAINERS_KEY);
    if (!existingTrainers || existingTrainers.length === 0) {
      const defaultTrainers: Trainer[] = [
        {
          id: '1',
          name: 'Ash Ketchum',
          email: 'ash@pokemon.com',
          teamCount: 6,
          createdAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Misty',
          email: 'misty@pokemon.com',
          teamCount: 4,
          createdAt: new Date('2024-01-02')
        },
        {
          id: '3',
          name: 'Brock',
          email: 'brock@pokemon.com',
          teamCount: 5,
          createdAt: new Date('2024-01-03')
        },
        {
          id: '4',
          name: 'Gary Oak',
          email: 'gary@pokemon.com',
          teamCount: 8,
          createdAt: new Date('2024-01-04')
        },
        {
          id: '5',
          name: 'Team Rocket',
          email: 'teamrocket@pokemon.com',
          teamCount: 2,
          bannedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Banned for 7 days
          createdAt: new Date('2024-01-05')
        }
      ];
      storage.set(this.TRAINERS_KEY, defaultTrainers);
    }
  }
}
