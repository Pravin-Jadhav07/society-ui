import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { AuthService } from '../../../core/auth/auth.service';
import { SocietyItem, SocietyService } from '../../../core/society/society.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonSpinner,
    IonNote,
  ],
})
export class RegisterPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly societiesApi = inject(SocietyService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    societyId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    wing: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    flatNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    residentType: new FormControl<'OWNER' | 'TENANT' | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly societies = signal<SocietyItem[]>([]);
  readonly error = signal('');
  readonly success = signal('');
  readonly loading = signal(false);
  readonly loadingSocieties = signal(true);
  readonly submitted = signal(false);
  readonly formTick = signal(0);

  ngOnInit(): void {
    this.societiesApi.listActive().subscribe({
      next: (list) => {
        this.societies.set(list);
        this.loadingSocieties.set(false);
        if (list.length === 1) {
          this.form.controls.societyId.setValue(list[0].id);
        }
      },
      error: () => {
        this.loadingSocieties.set(false);
        this.error.set('Unable to load societies');
      },
    });
  }

  touch(controlName: keyof typeof this.form.controls): void {
    this.form.controls[controlName].markAsTouched();
    this.formTick.update((n) => n + 1);
  }

  fieldError(
    controlName: keyof typeof this.form.controls,
    labels: { required?: string; pattern?: string; email?: string; minlength?: string },
  ): string {
    this.formTick();
    const control = this.form.controls[controlName];
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (control.hasError('required')) {
      return labels.required ?? 'Required';
    }
    if (control.hasError('pattern')) {
      return labels.pattern ?? 'Invalid value';
    }
    if (control.hasError('email')) {
      return labels.email ?? 'Enter a valid email';
    }
    if (control.hasError('minlength')) {
      return labels.minlength ?? 'Too short';
    }
    return '';
  }

  submit(): void {
    this.submitted.set(true);
    this.error.set('');
    this.success.set('');
    this.form.markAllAsTouched();
    this.formTick.update((n) => n + 1);

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    if (value.societyId == null || value.residentType === '') {
      return;
    }

    this.loading.set(true);

    this.auth
      .register({
        societyId: value.societyId,
        fullName: value.fullName.trim(),
        username: value.username.trim(),
        email: value.email.trim(),
        password: value.password,
        wing: value.wing.trim(),
        flatNumber: value.flatNumber.trim(),
        residentType: value.residentType,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.success.set(
            res.message ?? 'Registration received. Please wait for admin approval.',
          );
          this.form.reset({
            societyId: value.societyId,
            fullName: '',
            username: '',
            email: '',
            password: '',
            wing: '',
            flatNumber: '',
            residentType: '',
          });
          this.submitted.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(this.auth.errorMessage(err, 'Registration failed'));
        },
      });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }
}
