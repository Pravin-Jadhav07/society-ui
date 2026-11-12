import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type LoginResponse = {
  token: string;
  refreshToken: string;
  role: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'token';
  private readonly refreshKey = 'refreshToken';
  private readonly roleKey = 'role';

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.refreshKey, res.refreshToken);
          localStorage.setItem(this.roleKey, res.role);
        }),
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.roleKey);
  }

  errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string' && body.trim()) {
        try {
          const parsed = JSON.parse(body) as { message?: string };
          if (typeof parsed.message === 'string' && parsed.message.trim()) {
            return parsed.message;
          }
        } catch {
          return body;
        }
      }
      if (body && typeof body === 'object' && 'message' in body) {
        const message = (body as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
      if (error.status === 401) {
        return 'Invalid username or password';
      }
      if (error.status === 403) {
        return 'Your account is disabled. Please wait for admin approval.';
      }
    }
    return 'Unable to login';
  }
}
