import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { JwtPayload, LoginResponse, RegisterRequest, User } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'hr_access_token';
  private readonly REFRESH_TOKEN_KEY = 'hr_refresh_token';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/register`, request);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.setToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
          this.currentUserSubject.next(this.getUserFromToken());
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return {
        id:    decoded.sub,
        email: decoded.email,
        name:  decoded.name,
        role:  decoded.role
      };
    } catch {
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}
