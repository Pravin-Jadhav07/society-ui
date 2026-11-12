import { Component, input, output } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon],
})
export class AppHeaderComponent {
  /** Left title, e.g. wing + flat */
  readonly flatLabel = input('—');
  readonly subtitle = input('');
  readonly profileClick = output<void>();
}
