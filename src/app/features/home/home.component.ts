import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="min-h-screen bg-background flex flex-col">

      <!-- Top bar -->
      <div class="flex justify-end p-4">
        <button
          (click)="themeService.toggle()"
          class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors"
          [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (themeService.isDark()) {
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col items-center justify-center px-6 pb-12">

        <!-- App title -->
        <div class="text-center mb-12">
          <h1 class="font-display font-bold text-4xl text-foreground mb-2">Focus</h1>
          <p class="text-muted-foreground text-base">Your personal productivity companion</p>
        </div>

        <!-- Big navigation buttons -->
        <div class="w-full max-w-sm flex flex-col gap-4">

          <!-- Goals button -->
          <button
            (click)="router.navigate(['/goals'])"
            class="w-full rounded-2xl border-2 border-border bg-card hover:bg-secondary hover:border-accent transition-all duration-200 p-8 text-left group shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <span class="text-3xl">🎯</span>
              </div>
              <div>
                <h2 class="font-display font-bold text-xl text-foreground">Goals</h2>
                <p class="text-sm text-muted-foreground mt-0.5">Track monthly goals & tasks</p>
              </div>
              <svg class="ml-auto text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>

          <!-- Wallet button -->
          <button
            (click)="router.navigate(['/wallet'])"
            class="w-full rounded-2xl border-2 border-border bg-card hover:bg-secondary hover:border-accent transition-all duration-200 p-8 text-left group shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <span class="text-3xl">💰</span>
              </div>
              <div>
                <h2 class="font-display font-bold text-xl text-foreground">Wallet</h2>
                <p class="text-sm text-muted-foreground mt-0.5">Manage budget & expenses</p>
              </div>
              <svg class="ml-auto text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>

          <!-- English button -->
          <button
            (click)="router.navigate(['/english'])"
            class="w-full rounded-2xl border-2 border-border bg-card hover:bg-secondary hover:border-accent transition-all duration-200 p-8 text-left group shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <span class="text-3xl">📖</span>
              </div>
              <div>
                <h2 class="font-display font-bold text-xl text-foreground">English</h2>
                <p class="text-sm text-muted-foreground mt-0.5">Words & phrases to learn</p>
              </div>
              <svg class="ml-auto text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>

        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  constructor(
    readonly router: Router,
    readonly themeService: ThemeService,
  ) {}
}
