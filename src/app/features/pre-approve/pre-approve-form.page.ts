import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonPopover,
  IonSpinner,
  IonText,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import {
  PreApprovalPayload,
  PreApprovalService,
  PreApprovalType,
} from '../../core/pre-approvals/pre-approval.service';

addIcons({ arrowBackOutline });

@Component({
  selector: 'app-pre-approve-form',
  templateUrl: './pre-approve-form.page.html',
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonText,
    IonSpinner,
    IonNote,
    IonPopover,
    IonDatetime,
  ],
})
export class PreApproveFormPage implements ViewWillEnter {
  private readonly auth = inject(AuthService);
  private readonly api = inject(PreApprovalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly type = signal<PreApprovalType>('GUEST');
  readonly editId = signal<number | null>(null);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly formTick = signal(0);
  /** Stable ISO value for ion-datetime (avoids rebinding every CD cycle). */
  readonly timePickerValue = signal(this.defaultTimeIso());

  readonly form = new FormGroup({
    visitDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, (control) => this.notPastDay(control)],
    }),
    approxEntryTime: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, (control) => this.notPastTime(control)],
    }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    mobileNumber: new FormControl('', { nonNullable: true }),
    vehicleLast4: new FormControl('', { nonNullable: true }),
  });

  ionViewWillEnter(): void {
    this.resetForm();
    const kind = (this.route.snapshot.paramMap.get('type') ?? 'guest').toUpperCase();
    if (kind !== 'GUEST' && kind !== 'VEHICLE') {
      void this.router.navigateByUrl('/pre-approve');
      return;
    }
    this.type.set(kind);
    this.applyTypeValidators(kind);

    const editRaw = this.route.snapshot.queryParamMap.get('edit');
    const id = editRaw ? Number(editRaw) : NaN;
    if (Number.isFinite(id) && id > 0) {
      this.loadForEdit(id);
    } else {
      this.form.controls.visitDate.setValue(this.todayIso());
    }
  }

  pageTitle(): string {
    const prefix = this.editId() ? 'Edit' : 'Pre-Approve';
    return this.type() === 'VEHICLE' ? `${prefix} Vehicle` : `${prefix} Guest`;
  }

  isGuest(): boolean {
    return this.type() === 'GUEST';
  }

  timeDisplay(): string {
    this.formTick();
    return this.formatTimeLabel(this.form.controls.approxEntryTime.value);
  }

  minDay(): string {
    return this.todayIso();
  }

  /** Earliest selectable time when the visit day is today. */
  entryTimeMin(): string | undefined {
    this.formTick();
    const min = this.minHhMmForSelectedDay();
    if (!min) {
      return undefined;
    }
    const day = this.form.controls.visitDate.value || this.todayIso();
    return `${day}T${min}:00`;
  }

  onVisitDateChange(): void {
    this.form.controls.visitDate.markAsTouched();
    this.form.controls.approxEntryTime.updateValueAndValidity();
    this.formTick.update((n) => n + 1);
  }

  prepareTimePicker(): void {
    let existing = (this.form.controls.approxEntryTime.value || this.nowHhMm()).slice(0, 5);
    const min = this.minHhMmForSelectedDay();
    if (min && existing < min) {
      existing = min;
    }
    this.timePickerValue.set(this.toTimeIso(existing));
  }

  onTimeChange(event: Event): void {
    const value = this.readDatetimeValue(event);
    if (!value) {
      return;
    }
    this.timePickerValue.set(value.includes('T') ? value : this.toTimeIso(value));
    this.applyTimeToForm(value);
  }

  fieldError(name: 'visitDate' | 'approxEntryTime' | 'name' | 'mobileNumber' | 'vehicleLast4'): string {
    this.formTick();
    const control = this.form.controls[name];
    if (!this.submitted() && !control.touched) {
      return '';
    }
    if (name === 'visitDate' && control.hasError('past')) {
      return 'Day cannot be in the past';
    }
    if (name === 'approxEntryTime' && control.hasError('past')) {
      return 'Entry time cannot be in the past';
    }
    if (control.hasError('required')) {
      if (name === 'visitDate') return 'Day is required';
      if (name === 'approxEntryTime') return 'Approx entry time is required';
      if (name === 'name') return 'Name is required';
      if (name === 'mobileNumber') return 'Mobile number is required';
      if (name === 'vehicleLast4') return 'Last 4 digits are required';
    }
    if (control.hasError('pattern')) {
      if (name === 'mobileNumber') return 'Enter a valid 10-digit mobile number';
      if (name === 'vehicleLast4') return 'Enter exactly 4 digits';
    }
    return '';
  }

  canSave(): boolean {
    return this.form.valid && !this.loading();
  }

  goBack(): void {
    void this.router.navigateByUrl('/pre-approve');
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

    const payload = this.toPayload();
    const id = this.editId();
    this.loading.set(true);

    const request$ =
      id == null ? this.api.create(payload) : this.api.update(id, payload);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl('/tabs/home');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          this.auth.errorMessage(
            err,
            id == null ? 'Unable to save pre-approval' : 'Unable to update pre-approval',
          ),
        );
      },
    });
  }

  private toPayload(): PreApprovalPayload {
    const raw = this.form.getRawValue();
    const payload: PreApprovalPayload = {
      type: this.type(),
      visitDate: raw.visitDate,
      approxEntryTime: raw.approxEntryTime.length === 5
        ? `${raw.approxEntryTime}:00`
        : raw.approxEntryTime,
      name: raw.name.trim(),
    };
    if (this.isGuest()) {
      payload.mobileNumber = raw.mobileNumber.trim();
    } else {
      payload.vehicleLast4 = raw.vehicleLast4.trim();
    }
    return payload;
  }

  private loadForEdit(id: number): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: (entry) => {
        if (entry.type !== this.type()) {
          this.loading.set(false);
          this.error.set('This entry belongs to another category');
          return;
        }
        this.editId.set(entry.id);
        const hhmm = (entry.approxEntryTime ?? '').slice(0, 5);
        this.form.reset({
          visitDate: entry.visitDate,
          approxEntryTime: hhmm,
          name: entry.name,
          mobileNumber: entry.mobileNumber ?? '',
          vehicleLast4: entry.vehicleLast4 ?? '',
        });
        this.timePickerValue.set(this.toTimeIso(hhmm || '09:00'));
        if (this.form.controls.visitDate.hasError('past')) {
          this.form.controls.visitDate.markAsTouched();
        }
        if (this.form.controls.approxEntryTime.hasError('past')) {
          this.form.controls.approxEntryTime.markAsTouched();
        }
        this.loading.set(false);
        this.formTick.update((n) => n + 1);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.auth.errorMessage(err, 'Unable to load entry'));
      },
    });
  }

  private applyTypeValidators(type: PreApprovalType): void {
    const mobile = this.form.controls.mobileNumber;
    const vehicle = this.form.controls.vehicleLast4;
    mobile.clearValidators();
    vehicle.clearValidators();
    if (type === 'GUEST') {
      mobile.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
    } else {
      vehicle.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
    }
    mobile.updateValueAndValidity({ emitEvent: false });
    vehicle.updateValueAndValidity({ emitEvent: false });
  }

  private resetForm(): void {
    this.editId.set(null);
    this.error.set('');
    this.loading.set(false);
    this.submitted.set(false);
    this.timePickerValue.set(this.defaultTimeIso());
    this.form.reset({
      visitDate: '',
      approxEntryTime: '',
      name: '',
      mobileNumber: '',
      vehicleLast4: '',
    });
    this.formTick.update((n) => n + 1);
  }

  private applyTimeToForm(isoOrTime: string): void {
    const hhmm = this.extractHhMm(isoOrTime);
    if (!hhmm) {
      return;
    }
    this.form.controls.approxEntryTime.setValue(hhmm);
    this.form.controls.approxEntryTime.markAsDirty();
    this.form.controls.approxEntryTime.markAsTouched();
    this.form.controls.approxEntryTime.updateValueAndValidity({ emitEvent: false });
    this.formTick.update((n) => n + 1);
  }

  private readDatetimeValue(event: Event): string {
    const detail = (event as CustomEvent<{ value?: string | string[] | null }>).detail;
    const raw = detail?.value;
    if (Array.isArray(raw)) {
      return String(raw[0] ?? '');
    }
    return String(raw ?? '');
  }

  private extractHhMm(value: string): string {
    const normalized = value.trim();
    const fromIso = normalized.match(/T(\d{2}:\d{2})/);
    if (fromIso) {
      return fromIso[1];
    }
    if (/^\d{2}:\d{2}/.test(normalized)) {
      return normalized.slice(0, 5);
    }
    return '';
  }

  private formatTimeLabel(rawValue: string): string {
    const raw = (rawValue ?? '').slice(0, 5);
    const [hh, mm] = raw.split(':').map((part) => Number(part));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
      return '';
    }
    const suffix = hh >= 12 ? 'PM' : 'AM';
    const hour12 = hh % 12 || 12;
    return `${hour12}:${String(mm).padStart(2, '0')} ${suffix}`;
  }

  private toTimeIso(hhmm: string): string {
    const time = (hhmm || '09:00').slice(0, 5);
    const date = this.form.controls.visitDate.value || this.todayIso();
    return `${date}T${time}:00`;
  }

  private defaultTimeIso(): string {
    return `${this.todayIso()}T09:00:00`;
  }

  private notPastDay(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    if (!value || value >= this.todayIso()) {
      return null;
    }
    return { past: true };
  }

  private notPastTime(control: AbstractControl): ValidationErrors | null {
    const time = String(control.value ?? '').slice(0, 5);
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return null;
    }
    const min = this.minHhMmForSelectedDay();
    if (min && time < min) {
      return { past: true };
    }
    return null;
  }

  private minHhMmForSelectedDay(): string {
    const day = this.form?.controls.visitDate.value ?? '';
    if (day !== this.todayIso()) {
      return '';
    }
    return this.nowHhMm();
  }

  private nowHhMm(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  private todayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }
}
