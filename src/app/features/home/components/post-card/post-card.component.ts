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
  createOutline,
  ellipsisVertical,
  trashOutline,
} from 'ionicons/icons';
import { SocietyPost } from '../../../../core/posts/post.service';

addIcons({
  ellipsisVertical,
  createOutline,
  trashOutline,
});

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
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
export class PostCardComponent {
  readonly post = input.required<SocietyPost>();

  readonly edit = output<SocietyPost>();
  readonly remove = output<SocietyPost>();

  menuId(): string {
    return `post-menu-${this.post().id}`;
  }

  visibilityLabel(): string {
    switch (this.post().visibility) {
      case 'OWNERS':
        return 'Owners';
      case 'TENANTS':
        return 'Tenants';
      default:
        return 'All Residents';
    }
  }

  authorLine(): string {
    const post = this.post();
    const wing = post.authorWing?.trim() ?? '';
    const flat = post.authorFlatNumber?.trim() ?? '';
    const place = [wing, flat].filter(Boolean).join('-');
    const name = post.authorName?.trim() || 'Resident';
    return place ? `${name} · ${place}` : name;
  }

  onEdit(): void {
    this.edit.emit(this.post());
  }

  onDelete(): void {
    this.remove.emit(this.post());
  }
}
