import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'budget', loadComponent: () => import('./features/budget/components/budget-planner/budget-planner.component').then(m => m.BudgetPlannerComponent) },
  { path: 'dreams', loadComponent: () => import('./features/dreams/components/dream-board/dream-board.component').then(m => m.DreamBoardComponent) }
];
