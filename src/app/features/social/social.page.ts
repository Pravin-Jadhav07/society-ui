import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonText } from '@ionic/angular';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  imports: [AppHeaderComponent, IonContent, IonText],
})
export class SocialPage {
  private readonly router = inject(Router);

  openProfile(): void {
    void this.router.navigateByUrl('/tabs/profile');
  }
}
