import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  attachOutline,
  cameraOutline,
  chevronDownOutline,
  imageOutline,
  informationCircleOutline,
  sendOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { PostService, PostVisibility } from '../../core/posts/post.service';

addIcons({
  arrowBackOutline,
  informationCircleOutline,
  imageOutline,
  cameraOutline,
  attachOutline,
  sendOutline,
  chevronDownOutline,
});

@Component({
  selector: 'app-ask-society',
  templateUrl: './ask-society.page.html',
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonText,
    IonSpinner,
  ],
})
export class AskSocietyPage implements ViewWillEnter {
  private readonly auth = inject(AuthService);
  private readonly posts = inject(PostService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  fullName(): string {
    return this.auth.getFullName();
  }

  flatLabel(): string {
    return this.auth.getFlatLabel();
  }

  initials(): string {
    return this.auth.getInitials();
  }

  readonly audiencePopoverOptions = {
    cssClass: 'ask-audience-popover',
    size: 'auto' as const,
    side: 'bottom' as const,
    alignment: 'end' as const,
    dismissOnSelect: true,
  };

  readonly form = new FormGroup({
    body: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(2000)],
    }),
    visibility: new FormControl<PostVisibility>('ALL_RESIDENTS', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly error = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly formTick = signal(0);
  readonly editId = signal<number | null>(null);

  ionViewWillEnter(): void {
    this.resetCompose();
    const raw = this.route.snapshot.queryParamMap.get('edit');
    const id = raw ? Number(raw) : NaN;
    if (Number.isFinite(id) && id > 0) {
      this.loadForEdit(id);
    }
  }

  pageTitle(): string {
    return this.editId() ? 'Edit post' : 'Ask Society';
  }

  postButtonLabel(): string {
    return this.editId() ? 'Save' : 'Post';
  }

  bodyError(): string {
    this.formTick();
    const control = this.form.controls.body;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Write something to post';
    }
    if (control.hasError('maxlength')) {
      return 'Keep it under 2000 characters';
    }
    return '';
  }

  canPost(): boolean {
    return this.form.controls.body.value.trim().length > 0 && !this.loading();
  }

  goBack(): void {
    void this.router.navigateByUrl('/tabs/home');
  }

  showGuidelines(): void {
    this.error.set('Guidelines coming soon.');
  }

  submit(): void {
    if (this.loading()) {
      return;
    }

    this.submitted.set(true);
    this.error.set('');
    this.form.markAllAsTouched();
    this.formTick.update((n) => n + 1);

    if (this.form.invalid) {
      return;
    }

    const body = this.form.controls.body.getRawValue().trim();
    const visibility = this.form.controls.visibility.getRawValue();
    const id = this.editId();

    this.loading.set(true);
    const request$ =
      id == null
        ? this.posts.create(body, visibility)
        : this.posts.update(id, body, visibility);

    request$.subscribe({
      next: () => {
        this.resetCompose();
        void this.router.navigateByUrl('/tabs/home');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          this.auth.errorMessage(
            err,
            id == null ? 'Unable to create post' : 'Unable to update post',
          ),
        );
      },
    });
  }

  private loadForEdit(id: number): void {
    this.loading.set(true);
    this.posts.getOne(id).subscribe({
      next: (post) => {
        this.editId.set(post.id);
        this.form.reset({
          body: post.body,
          visibility: post.visibility,
        });
        this.loading.set(false);
        this.formTick.update((n) => n + 1);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.auth.errorMessage(err, 'Unable to load post'));
      },
    });
  }

  private resetCompose(): void {
    this.editId.set(null);
    this.form.reset({
      body: '',
      visibility: 'ALL_RESIDENTS',
    });
    this.error.set('');
    this.loading.set(false);
    this.submitted.set(false);
    this.formTick.update((n) => n + 1);
  }
}
