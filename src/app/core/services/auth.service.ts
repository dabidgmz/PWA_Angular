import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/auth';
import { storage } from '../utils/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'pokemon_user';
  private readonly TOKEN_KEY = 'pokemon_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUser(): User | null {
    return this.user;
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulación de login para demo
    const demoUser: User = {
      id: 'demo-user',
      email: email,
      name: 'Profesor Oak',
      role: 'prof_oak'
    };

    const token = 'demo-token-' + Date.now();

    this.setUser(demoUser, token);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    storage.remove(this.USER_KEY);
    storage.remove(this.TOKEN_KEY);
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private setUser(user: User, token: string): void {
    storage.set(this.USER_KEY, user);
    storage.set(this.TOKEN_KEY, token);
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private loadUserFromStorage(): void {
    const user = storage.get<User>(this.USER_KEY);
    const token = storage.get<string>(this.TOKEN_KEY);

    if (user && token) {
      this.userSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  updateUser(userData: Partial<User>): void {
    if (this.user) {
      const updatedUser = { ...this.user, ...userData };
      storage.set(this.USER_KEY, updatedUser);
      this.userSubject.next(updatedUser);
    }
  }
}
