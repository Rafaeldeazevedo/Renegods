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
          this.salvarUsuarioLocal(usuario);
        })
      );
  }

  buscarUsuarioPorId(id: number): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/usuarios/${id}`)
      .pipe(
        tap((usuario) => {
          this.salvarUsuarioLocal(usuario);
        })
      );
  }

  atualizarPerfil(id: number, payload: {
    nickname: string;
    fotoPerfil: string;
  }): Observable<LoginResponse> {
    return this.http.put<LoginResponse>(`${this.apiUrl}/usuarios/${id}/perfil`, payload)
      .pipe(
        tap((usuario) => {
          this.salvarUsuarioLocal(usuario);
        })
      );
  }

  salvarUsuarioLocal(usuario: LoginResponse): void {
    const usuarioAtual = this.getUsuarioLogado();

    const usuarioParaSalvar = {
      ...usuarioAtual,
      ...usuario
    };

    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));

    if (usuario.token) {
      localStorage.setItem('token', usuario.token);
    }
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