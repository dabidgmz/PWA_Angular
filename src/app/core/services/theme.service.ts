import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { storage } from '../utils/storage';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'pokemon_theme';
  private darkThemeSubject = new BehaviorSubject<boolean>(false);

  public isDarkTheme$ = this.darkThemeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  get isDarkTheme(): boolean {
    return this.darkThemeSubject.value;
  }

  setTheme(isDark: boolean): void {
    this.darkThemeSubject.next(isDark);
    storage.set(this.THEME_KEY, isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkTheme);
  }

  private loadTheme(): void {
    const savedTheme = storage.get<boolean>(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme !== null ? savedTheme : prefersDark;
    
    this.setTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}
