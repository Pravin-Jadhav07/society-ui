import { Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { HomeRefresh } from '../../core/home/home-refresh';
import { PostService, SocietyPost } from '../../core/posts/post.service';
import {
  PreApproval,
  PreApprovalService,
} from '../../core/pre-approvals/pre-approval.service';
import { AppHeaderComponent } from '../../layout/app-header/app-header.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { UpdateCardComponent } from './components/update-card/update-card.component';

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
    UpdateCardComponent,
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
  private readonly preApprovalsApi = inject(PreApprovalService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertController);
  private readonly homeRefresh = inject(HomeRefresh);
  private readonly content = viewChild(IonContent);

  constructor() {
    this.homeRefresh.reloads$.pipe(takeUntilDestroyed()).subscribe(() => this.reloadHome());
  }

  readonly quickActions = signal<QuickAction[]>([]);

  readonly updateShortcuts: UpdateItem[] = [
    { label: 'Daily Help', icon: 'hand-left-outline' },
    { label: 'Gatepass', icon: 'key-outline' },
  ];

  readonly posts = signal<SocietyPost[]>([]);
  readonly postsError = signal('');
  readonly postsLoading = signal(false);

  readonly updates = signal<PreApproval[]>([]);
  readonly updateDay = signal<'today' | 'yesterday'>('today');
  readonly updatesError = signal('');
  readonly updatesLoading = signal(false);

  welcomeName(): string {
    const name = this.auth.getFullName().trim();
    return name.length > 0 ? `, ${name}` : '';
  }

  ionViewWillEnter(): void {
    this.reloadHome();
  }

  private reloadHome(): void {
    void this.content()?.scrollToTop(200);
    this.quickActions.set(this.buildQuickActions());
    this.loadPosts();
    this.loadPreApprovals();
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

  private buildQuickActions(): QuickAction[] {
    const security: QuickAction = { label: 'Security', icon: 'body-outline', route: '/security' };

    const preApprove: QuickAction = this.auth.isSecurity()
      ? { label: 'Pre-Approve', icon: 'checkmark-circle-outline' }
      : { label: 'Pre-Approve', icon: 'checkmark-circle-outline', route: '/pre-approve' };

    return [
      security,
      preApprove,
      { label: 'Ask Society', icon: 'chatbox-ellipses-outline', route: '/ask-society' },
      { label: 'Post', icon: 'create-outline' },
      { label: 'View more', icon: 'grid-outline' },
    ];
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

  editPreApproval(entry: PreApproval): void {
    const path = entry.type === 'VEHICLE' ? 'vehicle' : 'guest';
    void this.router.navigate(['/pre-approve', path], {
      queryParams: { edit: entry.id },
    });
  }

  async cancelPreApproval(entry: PreApproval): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Cancel entry?',
      message: 'This pre-approval will be removed.',
      buttons: [
        { text: 'Keep', role: 'cancel' },
        {
          text: 'Cancel entry',
          role: 'destructive',
          handler: () => {
            this.preApprovalsApi.cancel(entry.id).subscribe({
              next: () => {
                this.updates.update((list) => list.filter((item) => item.id !== entry.id));
              },
              error: (err) => {
                this.updatesError.set(
                  this.auth.errorMessage(err, 'Unable to cancel entry'),
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

  setUpdateDay(day: 'today' | 'yesterday'): void {
    if (this.updateDay() === day) {
      return;
    }
    this.updateDay.set(day);
    this.loadPreApprovals();
  }

  private loadPreApprovals(): void {
    this.updatesLoading.set(true);
    this.updatesError.set('');
    const day = this.updateDay();
    const request$ = this.auth.isSecurity()
      ? this.preApprovalsApi.listGate(day)
      : this.preApprovalsApi.listMine(day);
    request$.subscribe({
      next: (list) => {
        this.updates.set(list ?? []);
        this.updatesLoading.set(false);
      },
      error: (err) => {
        this.updatesLoading.set(false);
        this.updatesError.set(
          this.auth.errorMessage(err, 'Unable to load updates'),
        );
      },
    });
  }
}
