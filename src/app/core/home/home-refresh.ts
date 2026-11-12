import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeRefresh {
  private readonly reloadsSubject = new Subject<void>();
  readonly reloads$ = this.reloadsSubject.asObservable();

  reload(): void {
    this.reloadsSubject.next();
  }
}
