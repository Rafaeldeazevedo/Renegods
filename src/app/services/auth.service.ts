import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest,LoginResponse } from '../model/auth.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

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

    return JSON.parse(usuario);
  }

  estaLogado(): boolean {
    return !!this.getUsuarioLogado();
  }
}