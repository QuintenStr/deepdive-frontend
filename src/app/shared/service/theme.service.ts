import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeKey = 'theme';

  constructor() {
    this.initThemeListener();
    this.initializeDefaultTheme();
  }

  private initThemeListener(): void {
    if (typeof window !== 'undefined') {
      const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQueryList.addEventListener('change', () => {
        if (this.getStoredTheme() === 'system') {
          this.applySystemPreference();
        }
      });
    }
  }

  private initializeDefaultTheme(): void {
    const storedTheme = this.getStoredTheme();
    if (!storedTheme) {
      this.setStoredTheme('system');
    } else {
      this.applyTheme(storedTheme);
    }
  }

  getStoredTheme(): string | null {
    return localStorage.getItem(this.themeKey);
  }

  setStoredTheme(theme: string): void {
    localStorage.setItem(this.themeKey, theme);
    this.applyTheme(theme);
  }

  getPreferredTheme(): string {
    const storedTheme = this.getStoredTheme();
    return storedTheme ? storedTheme : 'light';
  }

  getPreferredThemeAbsolut(): string {
    const storedTheme = this.getStoredTheme() || 'light';
    if (storedTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return storedTheme;
  }

  applyTheme(theme: string): void {
    if (theme === 'system') {
      this.applySystemPreference();
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
      document.documentElement.style.setProperty(
        '--overlay-bg-color',
        this.getPreferredThemeColor()
      );
    }
  }

  getPreferredThemeColor(): string {
    const preferredTheme = this.getPreferredTheme();
    return preferredTheme === 'dark'
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(255, 255, 255, 0.5)';
  }

  private applySystemPreference(): void {
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
}
