import { Component } from '@angular/core';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chatbubblesOutline,
  homeOutline,
  peopleOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  chatboxEllipsesOutline,
  createOutline,
  gridOutline,
  handLeftOutline,
  keyOutline,
  addCircleOutline,
  newspaperOutline,
} from 'ionicons/icons';

addIcons({
  homeOutline,
  peopleOutline,
  chatbubblesOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  chatboxEllipsesOutline,
  createOutline,
  gridOutline,
  handLeftOutline,
  keyOutline,
  addCircleOutline,
  newspaperOutline,
});

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {}
