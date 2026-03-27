import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'goals',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'goals/:monthKey',
    loadComponent: () => import('./features/month-detail/month-detail.component').then(m => m.MonthDetailComponent),
  },
  {
    path: 'wallet',
    loadComponent: () => import('./features/wallet/wallet-dashboard.component').then(m => m.WalletDashboardComponent),
  },
  {
    path: 'wallet/:monthKey',
    loadComponent: () => import('./features/wallet/wallet-month-detail.component').then(m => m.WalletMonthDetailComponent),
  },
  {
    path: 'english',
    loadComponent: () => import('./features/english/english.component').then(m => m.EnglishComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
