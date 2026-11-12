import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LoginResponse = {
  token: string;
  refreshToken: string;
  role: string;
  fullName?: string;
  societyName?: string;
};

export type ApiMessageResponse = {
  success?: boolean;
  message?: string;
};

type TokenPair = {
  token: string;
  refreshToken: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'token';
  private readonly refreshKey = 'refreshToken';
  private readonly roleKey = 'role';
  private readonly fullNameKey = 'fullName';
  private readonly societyNameKey = 'societyName';

  private refreshRequest$: Observable<TokenPair> | null = null;

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(tap((res) => this.saveSession(res)));
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

  forgotPassword(email: string) {
    return this.http.post<ApiMessageResponse>(
      `${environment.apiUrl}/auth/forgot-password`,
      { email },
    );
  }

  /** Backend expects query params: token, newPassword */
  resetPassword(token: string, newPassword: string) {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    return this.http.post<ApiMessageResponse>(
      `${environment.apiUrl}/auth/reset-password`,
      null,
      { params },
    );
  }

  /** Refresh access + refresh tokens. Shared if many 401s happen together. */
  refreshSession(): Observable<TokenPair> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.http
        .post<TokenPair>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
        .pipe(
          tap((res) => this.saveTokens(res.token, res.refreshToken)),
          catchError((err) => {
            this.clearSession();
            return throwError(() => err);
          }),
          shareReplay(1),
        );

      this.refreshRequest$.subscribe({
        error: () => {
          this.refreshRequest$ = null;
        },
        complete: () => {
          this.refreshRequest$ = null;
        },
      });
    }

    return this.refreshRequest$;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getFullName(): string {
    return localStorage.getItem(this.fullNameKey) ?? '';
  }

  getSocietyName(): string {
    return localStorage.getItem(this.societyNameKey) ?? 'Society';
  }

  /** Login role from backend, e.g. User | Admin */
  getRole(): string {
    return localStorage.getItem(this.roleKey) ?? '';
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
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
    localStorage.removeItem(this.fullNameKey);
    localStorage.removeItem(this.societyNameKey);
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

  private saveSession(res: LoginResponse): void {
    this.saveTokens(res.token, res.refreshToken);
    localStorage.setItem(this.roleKey, res.role);
    if (res.fullName) {
      localStorage.setItem(this.fullNameKey, res.fullName);
    }
    if (res.societyName) {
      localStorage.setItem(this.societyNameKey, res.societyName);
    }
  }

  private saveTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshKey, refreshToken);
  }
}
