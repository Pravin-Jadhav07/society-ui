import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonText } from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  imports: [AppHeaderComponent, IonContent, IonText],
})
export class SocialPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly flatLabel = this.auth.getFlatLabel();
  readonly societyName = this.auth.getSocietyName();

  openProfile(): void {
    void this.router.navigateByUrl('/tabs/profile');
  }
}
