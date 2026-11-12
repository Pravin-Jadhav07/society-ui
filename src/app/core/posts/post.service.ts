import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type PostVisibility = 'ALL_RESIDENTS' | 'OWNERS' | 'TENANTS';

export type SocietyPost = {
  id: number;
  body: string;
  visibility: PostVisibility;
  authorName: string;
  authorWing: string;
  authorFlatNumber: string;
  mine?: boolean;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);

  create(body: string, visibility: PostVisibility) {
    return this.http.post<SocietyPost>(`${environment.apiUrl}/posts`, {
      body,
      visibility,
    });
  }

  update(id: number, body: string, visibility: PostVisibility) {
    return this.http.put<SocietyPost>(`${environment.apiUrl}/posts/${id}`, {
      body,
      visibility,
    });
  }

  delete(id: number) {
    return this.http.delete<{ message?: string }>(`${environment.apiUrl}/posts/${id}`);
  }

  getOne(id: number) {
    return this.http.get<SocietyPost>(`${environment.apiUrl}/posts/${id}`);
  }

  list() {
    return this.http.get<SocietyPost[]>(`${environment.apiUrl}/posts`);
  }
}
