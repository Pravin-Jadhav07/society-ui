import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type SocietyItem = {
  id: number;
  name: string;
  code: string;
};

@Injectable({ providedIn: 'root' })
export class SocietyService {
  private readonly http = inject(HttpClient);

  listActive() {
    return this.http.get<SocietyItem[]>(`${environment.apiUrl}/societies`);
  }
}
