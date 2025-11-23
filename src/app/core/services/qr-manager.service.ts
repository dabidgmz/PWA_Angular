import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QRPokemon {
  id: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legend';
  timestamp: string;
}

export interface QRManagerResponse {
  pokemons: QRPokemon[];
  count: number;
  filters: {
    minId: number;
    maxId: number;
    rarity: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class QRManagerService {
  private readonly API_URL = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getQRPokemons(minId?: number, maxId?: number, rarity?: string): Observable<QRManagerResponse> {
    let params = new HttpParams();

    if (minId !== undefined && minId !== null) {
      params = params.set('minId', minId.toString());
    }

    if (maxId !== undefined && maxId !== null) {
      params = params.set('maxId', maxId.toString());
    }

    if (rarity && rarity !== '' && rarity !== 'all') {
      params = params.set('rarity', rarity);
    }

    return this.http.get<QRManagerResponse>(`${this.API_URL}/qr-manager`, { params });
  }
}

