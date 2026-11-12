import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonRow,
  IonText,
} from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';

type QuickAction = {
  label: string;
  icon: string;
};

type UpdateItem = {
  label: string;
  icon: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  imports: [
    AppHeaderComponent,
    IonContent,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
  ],
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly flatLabel = this.auth.getFlatLabel();
  readonly societyName = this.auth.getSocietyName();
  readonly fullName = this.auth.getFullName();

  readonly quickActions: QuickAction[] = [
    { label: 'Security', icon: 'shield-checkmark-outline' },
    { label: 'Ask Society', icon: 'chatbox-ellipses-outline' },
    { label: 'Post', icon: 'create-outline' },
    { label: 'View more', icon: 'grid-outline' },
  ];

  readonly updates: UpdateItem[] = [
    { label: 'Daily Help', icon: 'hand-left-outline' },
    { label: 'Gatepass', icon: 'key-outline' },
  ];

  openProfile(): void {
    void this.router.navigateByUrl('/tabs/profile');
  }
}
