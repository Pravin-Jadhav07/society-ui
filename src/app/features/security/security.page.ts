import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  callOutline,
  chatbubbleOutline,
  warningOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import {
  SecurityContactService,
  SecurityGuard,
} from '../../core/security/security-contact.service';

addIcons({
  arrowBackOutline,
  callOutline,
  chatbubbleOutline,
  warningOutline,
});

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent],
})
export class SecurityPage implements ViewWillEnter {
  private readonly auth = inject(AuthService);
  private readonly security = inject(SecurityContactService);
  private readonly router = inject(Router);

  readonly guards = signal<SecurityGuard[]>([]);
  readonly pickingCall = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  ionViewWillEnter(): void {
    this.pickingCall.set(false);
    this.error.set('');
  }

  goBack(): void {
    if (this.pickingCall()) {
      this.pickingCall.set(false);
      return;
    }
    void this.router.navigateByUrl('/tabs/home');
  }

  openCallList(): void {
    this.error.set('');
    this.loading.set(true);
    this.pickingCall.set(true);
    this.security.guards().subscribe({
      next: (list) => {
        this.guards.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.auth.errorMessage(err, 'Unable to load security'));
      },
    });
  }

  call(guard: SecurityGuard): void {
    const mobile = guard.mobile?.trim() ?? '';
    if (mobile.length === 0) {
      this.error.set('This guard has no mobile number');
      return;
    }
    window.location.href = `tel:${mobile}`;
  }
}
