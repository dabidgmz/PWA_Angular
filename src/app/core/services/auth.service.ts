import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest, VerifyCodeRequest, VerifyCodeResponse } from '../models/auth';
import { storage } from '../utils/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3333';
  private readonly USER_KEY = 'pokemon_user';
  private readonly TOKEN_KEY = 'pokemon_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return storage.get<string>(this.TOKEN_KEY);
  }

  getUser(): User | null {
    return this.user;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password };
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData).pipe(
      tap((response) => {
        // Solo guardar usuario y token si no requiere código
        if (!response.requiresCode && response.token) {
          this.setUser(response.user, response.token);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  verifyCode(email: string, code: string): Observable<VerifyCodeResponse> {
    const verifyData: VerifyCodeRequest = { email, code };
    
    return this.http.post<VerifyCodeResponse>(`${this.API_URL}/auth/verify-code`, verifyData).pipe(
      tap((response) => {
        this.setUser(response.user, response.token);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.API_URL}/auth/verify`, {
      params: { token }
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
    return this.user?.role === role || this.user?.role === 'profesor' || this.user?.role === 'professor';
  }

  isProfessor(): boolean {
    return this.hasRole('profesor') || this.hasRole('professor');
  }

  isTrainer(): boolean {
    return this.user?.role === 'trainer';
  }

  updateUser(userData: Partial<User>): void {
    if (this.user) {
      const updatedUser = { ...this.user, ...userData };
      storage.set(this.USER_KEY, updatedUser);
      this.userSubject.next(updatedUser);
    }
  }
}
