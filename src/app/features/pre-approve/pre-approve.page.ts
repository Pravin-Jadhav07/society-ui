import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  bodyOutline,
  carOutline,
  checkmarkCircleOutline,
  peopleOutline,
} from 'ionicons/icons';

addIcons({
  arrowBackOutline,
  peopleOutline,
  carOutline,
  bodyOutline,
  checkmarkCircleOutline,
});

type Category = {
  type: 'GUEST' | 'VEHICLE' | 'VISITING_HELP';
  title: string;
  subtitle: string;
  icon: string;
  disabled?: boolean;
};

@Component({
  selector: 'app-pre-approve',
  templateUrl: './pre-approve.page.html',
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent],
})
export class PreApprovePage {
  private readonly router = inject(Router);

  readonly categories: Category[] = [
    {
      type: 'GUEST',
      title: 'Guest',
      subtitle: 'Pre-approve a visitor for entry',
      icon: 'people-outline',
    },
    {
      type: 'VEHICLE',
      title: 'Vehicle',
      subtitle: 'Pre-approve a vehicle for entry',
      icon: 'car-outline',
    },
    {
      type: 'VISITING_HELP',
      title: 'Visiting Help',
      subtitle: 'Coming soon',
      icon: 'body-outline',
      disabled: true,
    },
  ];

  goBack(): void {
    void this.router.navigateByUrl('/tabs/home');
  }

  openCategory(category: Category): void {
    if (category.disabled) {
      return;
    }
    void this.router.navigate(['/pre-approve', category.type.toLowerCase()]);
  }
}
