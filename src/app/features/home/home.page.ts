import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonSpinner, IonText } from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [IonContent, IonButton, IonText, IonSpinner],
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly societyName = this.auth.getSocietyName();
  readonly fullName = this.auth.getFullName();
  readonly role = this.auth.getRole();
  readonly isAdmin = this.auth.isAdmin();
  readonly loggingOut = signal(false);

  logout(): void {
    if (this.loggingOut()) {
      return;
    }
    this.loggingOut.set(true);
    this.auth.logout().subscribe({
      next: () => this.afterLogout(),
      error: () => this.afterLogout(),
    });
  }

  private afterLogout(): void {
    this.loggingOut.set(false);
    void this.router.navigateByUrl('/login');
  }
}
