import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonNote,
  ],
})
export class ForgotPasswordPage {
  private readonly auth = inject(AuthService);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly error = signal('');
  readonly success = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly formTick = signal(0);

  touch(): void {
    this.form.controls.email.markAsTouched();
    this.formTick.update((n) => n + 1);
  }

  emailError(): string {
    this.formTick();
    const control = this.form.controls.email;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Enter email';
    }
    if (control.hasError('email')) {
      return 'Enter a valid email';
    }
    return '';
  }

  submit(): void {
    if (this.loading()) {
      return;
    }

    this.submitted.set(true);
    this.error.set('');
    this.success.set('');
    this.form.markAllAsTouched();
    this.formTick.update((n) => n + 1);

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    const email = this.form.controls.email.getRawValue().trim();

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        // Same copy whether email exists or not (security + one-line UX)
        this.success.set(
          'If an account exists for this email, check your inbox for a reset link.',
        );
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.auth.errorMessage(err, 'Unable to send reset link'));
      },
    });
  }
}
