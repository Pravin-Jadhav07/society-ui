import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonText } from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  imports: [AppHeaderComponent, IonContent, IonText, IonIcon],
})
export class CommunityPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly flatLabel = this.auth.getFlatLabel();
  readonly societyName = this.auth.getSocietyName();

  readonly placeholders = [
    { label: 'Notice board', icon: 'newspaper-outline' },
    { label: 'Society charges', icon: 'grid-outline' },
    { label: 'Gatepass', icon: 'key-outline' },
  ];

  openProfile(): void {
    void this.router.navigateByUrl('/tabs/profile');
  }
}
