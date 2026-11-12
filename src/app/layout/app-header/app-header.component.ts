import { Component, inject, output } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon],
})
export class AppHeaderComponent {
  private readonly auth = inject(AuthService);

  readonly profileClick = output<void>();

  flatLabel(): string {
    return this.auth.getFlatLabel();
  }

  subtitle(): string {
    return this.auth.getSocietyName();
  }
}
