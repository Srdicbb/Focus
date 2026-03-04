import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div class="text-6xl mb-4">🤔</div>
      <h1 class="font-display font-bold text-3xl text-foreground mb-2">Page not found</h1>
      <p class="text-muted-foreground mb-6">Looks like this page doesn't exist.</p>
      <button
        (click)="goHome()"
        class="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        Go to Dashboard
      </button>
    </div>
  `,
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
}
