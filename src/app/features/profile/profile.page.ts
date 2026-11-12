import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonSpinner, IonText } from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  imports: [AppHeaderComponent, IonContent, IonText, IonButton, IonSpinner],
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loggingOut = signal(false);

  fullName(): string {
    return this.auth.getFullName();
  }

  role(): string {
    return this.auth.getRole();
  }

  openProfile(): void {
    // already on profile
  }

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
