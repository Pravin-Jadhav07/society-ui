import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  carOutline,
  createOutline,
  ellipsisVertical,
  peopleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { PreApproval } from '../../../../core/pre-approvals/pre-approval.service';

addIcons({
  ellipsisVertical,
  createOutline,
  closeCircleOutline,
  peopleOutline,
  carOutline,
});

@Component({
  selector: 'app-update-card',
  templateUrl: './update-card.component.html',
  imports: [
    DatePipe,
    IonButton,
    IonIcon,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
  ],
})
export class UpdateCardComponent {
  readonly entry = input.required<PreApproval>();

  readonly edit = output<PreApproval>();
  readonly cancel = output<PreApproval>();

  menuId(): string {
    return `update-menu-${this.entry().id}`;
  }

  typeLabel(): string {
    return this.entry().type === 'VEHICLE' ? 'Vehicle' : 'Guest';
  }

  typeIcon(): string {
    return this.entry().type === 'VEHICLE' ? 'car-outline' : 'people-outline';
  }

  detailLine(): string {
    const e = this.entry();
    if (e.type === 'VEHICLE') {
      return `•••• ${e.vehicleLast4 ?? ''}`;
    }
    return e.mobileNumber ?? '';
  }

  flatLine(): string {
    const entry = this.entry();
    const wing = entry.creatorWing?.trim() ?? '';
    const flat = entry.creatorFlatNumber?.trim() ?? '';
    const place = [wing, flat].filter((part) => part.length > 0).join('-');
    const name = entry.creatorName?.trim() ?? '';
    return [name, place].filter((part) => part.length > 0).join(' · ');
  }

  timeLabel(): string {
    const raw = (this.entry().approxEntryTime ?? '').slice(0, 5);
    const [hh, mm] = raw.split(':').map((part) => Number(part));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
      return raw;
    }
    const suffix = hh >= 12 ? 'PM' : 'AM';
    const hour12 = hh % 12 || 12;
    return `${hour12}:${String(mm).padStart(2, '0')} ${suffix}`;
  }

  onEdit(): void {
    this.edit.emit(this.entry());
  }

  onCancel(): void {
    this.cancel.emit(this.entry());
  }
}
