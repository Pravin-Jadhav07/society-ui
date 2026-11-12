import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm) {
    return null;
  }
  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
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
export class ResetPasswordPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatch },
  );

  readonly token = signal('');
  readonly tokenMissing = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly formTick = signal(0);

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    if (!raw) {
      this.tokenMissing.set(true);
      this.error.set('This reset link is invalid. Request a new one.');
      return;
    }
    this.token.set(raw);
  }

  touch(controlName: 'password' | 'confirmPassword'): void {
    this.form.controls[controlName].markAsTouched();
    this.formTick.update((n) => n + 1);
  }

  passwordError(): string {
    this.formTick();
    const control = this.form.controls.password;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Enter new password';
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  confirmError(): string {
    this.formTick();
    const control = this.form.controls.confirmPassword;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Confirm your password';
    }
    if (this.form.hasError('mismatch') && (control.touched || this.submitted())) {
      return 'Passwords do not match';
    }
    return '';
  }

  submit(): void {
    if (this.loading() || this.tokenMissing() || this.success()) {
      return;
    }

    this.submitted.set(true);
    this.error.set('');
    this.form.markAllAsTouched();
    this.formTick.update((n) => n + 1);

    if (this.form.invalid) {
      return;
    }

    const token = this.token();
    if (!token) {
      this.tokenMissing.set(true);
      this.error.set('This reset link is invalid. Request a new one.');
      return;
    }

    this.loading.set(true);
    const password = this.form.controls.password.getRawValue();

    this.auth.resetPassword(token, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(res.message?.trim() || 'Password reset successful.');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.auth.errorMessage(err, 'Unable to reset password'));
      },
    });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }
}
