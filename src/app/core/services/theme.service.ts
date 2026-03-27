import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal(false);

  constructor() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      this.isDark.set(true);
    }
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
