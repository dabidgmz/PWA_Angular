import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Statistics {
  trainers: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  captures: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  activeTrainers: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
  totalCaptures: number;
}

export interface TopSpecies {
  id: number;
  pokeapiId: number;
  name: string;
  count: number;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  status: string;
  isBanned: boolean;
  isVerified: boolean;
  teamCount: number;
  totalPokemon: number;
  team?: any[];
  createdAt: string;
}

export interface TrainerListResponse {
  data: Trainer[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface Capture {
  id: number;
  trainer: {
    id: number;
    name: string;
    email: string;
  };
  pokemon: {
    id: number;
    pokeapiId: number;
    name: string;
    spriteUrl?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legend';
  capturedAt: string;
  formattedDate?: {
    day: number;
    month: number;
    year: number;
    hour: number;
    minute: number;
    second: number;
    full: string;
  };
}

export interface CaptureHistoryResponse {
  data: Capture[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.API_URL}/admin/statistics`);
  }

  getTopSpecies(): Observable<{ data: TopSpecies[] }> {
    return this.http.get<{ data: TopSpecies[] }>(`${this.API_URL}/admin/species/top`);
  }

  getAllTrainers(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: 'active' | 'banned' | 'all';
  }): Observable<TrainerListResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.perPage) httpParams = httpParams.set('perPage', params.perPage.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<TrainerListResponse>(`${this.API_URL}/admin/trainers/all`, {
      params: httpParams
    });
  }

  getCaptureHistory(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    trainerId?: number;
    speciesId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<CaptureHistoryResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.perPage) httpParams = httpParams.set('perPage', params.perPage.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.trainerId) httpParams = httpParams.set('trainerId', params.trainerId.toString());
    if (params?.speciesId) httpParams = httpParams.set('speciesId', params.speciesId.toString());
    if (params?.dateFrom) httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) httpParams = httpParams.set('dateTo', params.dateTo);

    return this.http.get<CaptureHistoryResponse>(`${this.API_URL}/admin/captures/history`, {
      params: httpParams
    });
  }

  banTrainer(trainerId: number, banned: boolean): Observable<any> {
    return this.http.patch(`${this.API_URL}/admin/trainers/${trainerId}/ban`, {
      banned
    });
  }

  getMetrics(): Observable<any> {
    return this.http.get(`${this.API_URL}/admin/metrics`);
  }

  getProfessorProfile(): Observable<ProfessorProfile> {
    // Intentar obtener del cache primero si no hay conexión
    const cachedProfile = this.getCachedProfile();
    if (cachedProfile && navigator.onLine === false) {
      return of(cachedProfile);
    }
    
    return this.http.get<ProfessorProfile>(`${this.API_URL}/profesores/me`).pipe(
      tap((profile) => {
        // Guardar en cache
        this.cacheProfile(profile);
      }),
      catchError((error) => {
        // Si hay error pero hay cache, devolver cache
        const cachedProfile = this.getCachedProfile();
        if (cachedProfile) {
          return of(cachedProfile);
        }
        return throwError(() => error);
      })
    );
  }

  updateProfessorProfile(data: UpdateProfessorProfileRequest): Observable<UpdateProfessorProfileResponse> {
    return this.http.put<UpdateProfessorProfileResponse>(`${this.API_URL}/profesores/me`, data).pipe(
      tap((response) => {
        // Actualizar cache después de actualizar
        this.cacheProfile(response.profesor);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
  
  private getCachedProfile(): ProfessorProfile | null {
    try {
      const cached = localStorage.getItem('professor_profile_cache');
      if (cached) {
        const profile = JSON.parse(cached);
        // Verificar que no esté expirado (7 días)
        const cacheDate = new Date(profile.cachedAt);
        const daysDiff = (new Date().getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          return profile.data;
        }
      }
    } catch (error) {
      console.error('Error reading cached profile:', error);
    }
    return null;
  }
  
  private cacheProfile(profile: ProfessorProfile): void {
    try {
      const cacheData = {
        data: profile,
        cachedAt: new Date().toISOString()
      };
      localStorage.setItem('professor_profile_cache', JSON.stringify(cacheData));
      
      // También guardar en service worker cache si está disponible
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.open('pokemon-cache-v1').then(cache => {
          cache.put(
            new Request(`${this.API_URL}/profesores/me`),
            new Response(JSON.stringify(profile), {
              headers: { 'Content-Type': 'application/json' }
            })
          );
        });
      }
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  }
}

export interface ProfessorProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  role: 'profesor';
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfessorProfileRequest {
  name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | null;
}

export interface UpdateProfessorProfileResponse {
  message: string;
  profesor: ProfessorProfile;
}
