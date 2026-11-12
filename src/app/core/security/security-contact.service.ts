import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type SecurityGuard = {
  id: number;
  fullName: string;
  mobile: string;
};

@Injectable({ providedIn: 'root' })
export class SecurityContactService {
  private readonly http = inject(HttpClient);

  guards() {
    return this.http.get<SecurityGuard[]>(`${environment.apiUrl}/security/guards`);
  }
}
