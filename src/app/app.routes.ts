import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { ForgotPasswordPage } from './features/auth/forgot-password/forgot-password.page';
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';
import { ResetPasswordPage } from './features/auth/reset-password/reset-password.page';
import { HomePage } from './features/home/home.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordPage, canActivate: [guestGuard] },
  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];

