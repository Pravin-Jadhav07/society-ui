import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [
    ReactiveFormsModule,
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
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  readonly error = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);
  /** Bumps so field errors refresh under zoneless change detection. */
  readonly formTick = signal(0);

  touch(controlName: 'username' | 'password'): void {
    this.form.controls[controlName].markAsTouched();
    this.formTick.update((n) => n + 1);
  }

  mobileError(): string {
    this.formTick();
    const control = this.form.controls.username;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Enter mobile number';
    }
    if (control.hasError('pattern')) {
      return 'Enter a valid 10-digit mobile number';
    }
    return '';
  }

  passwordError(): string {
    this.formTick();
    const control = this.form.controls.password;
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Enter password';
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  submit(): void {
    this.submitted.set(true);
    this.error.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    const { username, password } = this.form.getRawValue();

    this.auth.login(username.trim(), password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.auth.errorMessage(err));
      },
    });
  }
}
