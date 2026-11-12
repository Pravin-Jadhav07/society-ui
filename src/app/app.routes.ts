import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/login/login.page';
import { HomePage } from './features/home/home.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: '**', redirectTo: 'login' },
];
