import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonText } from '@ionic/angular';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  imports: [AppHeaderComponent, IonContent, IonText, IonIcon],
})
export class CommunityPage {
  private readonly router = inject(Router);

  readonly placeholders = [
    { label: 'Notice board', icon: 'newspaper-outline' },
    { label: 'Society charges', icon: 'grid-outline' },
    { label: 'Gatepass', icon: 'key-outline' },
  ];

  openProfile(): void {
    void this.router.navigateByUrl('/tabs/profile');
  }
}
