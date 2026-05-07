import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../model/auth.model';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap((usuario) => {
          localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

          if (usuario.token) {
            localStorage.setItem('token', usuario.token);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');
  }

  getUsuarioLogado(): LoginResponse | null {
    const usuario = localStorage.getItem('usuarioLogado');

    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario) as LoginResponse;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  estaLogado(): boolean {
    return !!this.getToken();
  }
}