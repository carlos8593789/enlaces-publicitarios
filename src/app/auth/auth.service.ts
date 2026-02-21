import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly tokenTypeKey = 'auth_token_type';
  private readonly expiresKey = 'auth_expires_at';
  private readonly roleKey = 'auth_role';
  private readonly loginUrl = `${environment.apiBaseUrl}/api/auth/login`;

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<{
        token?: string;
        access_token?: string;
        token_type?: string;
        expires_in?: number;
        role?: string;
        user?: { role?: string };
      }>(
        this.loginUrl,
        { email, password }
      )
      .pipe(
        map((response) => {
          const token = response?.token ?? response?.access_token;
          if (!token) {
            return false;
          }
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, email);
          const role = response?.role ?? response?.user?.role ?? 'admin';
          localStorage.setItem(this.roleKey, role);
          if (response?.token_type) {
            localStorage.setItem(this.tokenTypeKey, response.token_type);
          }
          if (response?.expires_in) {
            const expiresAt = Date.now() + response.expires_in * 1000;
            localStorage.setItem(this.expiresKey, expiresAt.toString());
          }
          return true;
        }),
        catchError(() => of(false))
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenTypeKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return false;
    }

    const expiresAtRaw = localStorage.getItem(this.expiresKey);
    if (!expiresAtRaw) {
      return true;
    }

    const expiresAt = Number(expiresAtRaw);
    return Number.isFinite(expiresAt) ? Date.now() < expiresAt : true;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.userKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }
}
