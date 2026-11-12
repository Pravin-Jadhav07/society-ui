import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HomeRefresh } from '../../core/home/home-refresh';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  bodyOutline,
  carOutline,
  chatboxEllipsesOutline,
  chatbubblesOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  createOutline,
  gridOutline,
  handLeftOutline,
  homeOutline,
  keyOutline,
  newspaperOutline,
  peopleOutline,
  personCircleOutline,
} from 'ionicons/icons';

addIcons({
  homeOutline,
  peopleOutline,
  chatbubblesOutline,
  personCircleOutline,
  bodyOutline,
  checkmarkCircleOutline,
  chatboxEllipsesOutline,
  createOutline,
  gridOutline,
  handLeftOutline,
  keyOutline,
  addCircleOutline,
  newspaperOutline,
  carOutline,
  closeCircleOutline,
});

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  private readonly router = inject(Router);
  private readonly homeRefresh = inject(HomeRefresh);

  onHomeTab(): void {
    const path = this.router.url.split('?')[0];
    if (path === '/tabs/home') {
      this.homeRefresh.reload();
    }
  }
}
