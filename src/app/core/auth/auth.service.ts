import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
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

  register(body: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    wing: string;
    flatNumber: string;
    residentType: 'OWNER' | 'TENANT';
    societyId: number;
    mobileNumber?: string;
  }) {
    return this.http.post<{ message?: string }>(
      `${environment.apiUrl}/auth/register`,
      body,
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  /** Calls backend to revoke refresh token, then always clears local session. */
  logout(): Observable<unknown> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return of(null);
    }

    return this.http
      .post(`${environment.apiUrl}/auth/logout`, { refreshToken })
      .pipe(
        catchError(() => of(null)),
        tap(() => this.clearSession()),
      );
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.roleKey);
  }

  errorMessage(error: unknown, fallback = 'Something went wrong'): string {
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
    return fallback;
  }
}
