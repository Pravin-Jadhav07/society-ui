import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonRow,
  IonText,
  ViewWillEnter,
} from '@ionic/angular';
import { AuthService } from '../../core/auth/auth.service';
import { PostService, SocietyPost } from '../../core/posts/post.service';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';
import { PostCardComponent } from './components/post-card/post-card.component';

type QuickAction = {
  label: string;
  icon: string;
  route?: string;
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
    PostCardComponent,
    IonContent,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
  ],
})
export class HomePage implements ViewWillEnter {
  private readonly auth = inject(AuthService);
  private readonly postsApi = inject(PostService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertController);

  readonly flatLabel = this.auth.getFlatLabel();
  readonly societyName = this.auth.getSocietyName();
  readonly fullName = this.auth.getFullName();

  readonly quickActions: QuickAction[] = [
    { label: 'Security', icon: 'shield-checkmark-outline' },
    { label: 'Ask Society', icon: 'chatbox-ellipses-outline', route: '/ask-society' },
    { label: 'Post', icon: 'create-outline' },
    { label: 'View more', icon: 'grid-outline' },
  ];

  readonly updates: UpdateItem[] = [
    { label: 'Daily Help', icon: 'hand-left-outline' },
    { label: 'Gatepass', icon: 'key-outline' },
  ];

  readonly posts = signal<SocietyPost[]>([]);
  readonly postsError = signal('');
  readonly postsLoading = signal(false);

  ionViewWillEnter(): void {
    this.loadPosts();
  }

  openProfile(): void {
    void this.router.navigateByUrl('/tabs/profile');
  }

  onAction(action: QuickAction): void {
    if (!action.route) {
      return;
    }
    void this.router.navigateByUrl(action.route);
  }

  openAskSociety(): void {
    void this.router.navigateByUrl('/ask-society');
  }

  editPost(post: SocietyPost): void {
    void this.router.navigate(['/ask-society'], {
      queryParams: { edit: post.id },
    });
  }

  async deletePost(post: SocietyPost): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Delete post?',
      message: 'This post will be removed from the society feed.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.postsApi.delete(post.id).subscribe({
              next: () => {
                this.posts.update((list) => list.filter((p) => p.id !== post.id));
              },
              error: (err) => {
                this.postsError.set(
                  this.auth.errorMessage(err, 'Unable to delete post'),
                );
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private loadPosts(): void {
    this.postsLoading.set(true);
    this.postsError.set('');
    this.postsApi.list().subscribe({
      next: (list) => {
        this.posts.set(list ?? []);
        this.postsLoading.set(false);
      },
      error: (err) => {
        this.postsLoading.set(false);
        this.postsError.set(this.auth.errorMessage(err, 'Unable to load posts'));
      },
    });
  }
}
