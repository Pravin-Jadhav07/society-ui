import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { ForgotPasswordPage } from './features/auth/forgot-password/forgot-password.page';
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';
import { ResetPasswordPage } from './features/auth/reset-password/reset-password.page';
import { AskSocietyPage } from './features/ask-society/ask-society.page';
import { CommunityPage } from './features/community/community.page';
import { HomePage } from './features/home/home.page';
import { PreApproveFormPage } from './features/pre-approve/pre-approve-form.page';
import { PreApprovePage } from './features/pre-approve/pre-approve.page';
import { ProfilePage } from './features/profile/profile.page';
import { SecurityPage } from './features/security/security.page';
import { SocialPage } from './features/social/social.page';
import { TabsPage } from './layout/tabs/tabs.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordPage, canActivate: [guestGuard] },
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomePage },
      { path: 'community', component: CommunityPage },
      { path: 'social', component: SocialPage },
      { path: 'profile', component: ProfilePage },
    ],
  },
  { path: 'ask-society', component: AskSocietyPage, canActivate: [authGuard] },
  { path: 'security', component: SecurityPage, canActivate: [authGuard] },
  { path: 'pre-approve', component: PreApprovePage, canActivate: [authGuard] },
  {
    path: 'pre-approve/:type',
    component: PreApproveFormPage,
    canActivate: [authGuard],
  },
  { path: 'home', redirectTo: 'tabs/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
