import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  UsuarioLogado,
  TrocarSenhaRequest,
  ValidarTokenResponse
} from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

 login(request: LoginRequest): Observable<UsuarioLogado> {
  return this.http.post<UsuarioLogado>(`${this.apiUrl}/login`, request).pipe(
    tap((usuario) => {
      this.salvarUsuarioLocal(usuario);
    })
  );
}
  trocarSenha(request: TrocarSenhaRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/trocar-senha`, request, {
      responseType: 'text'
    });
  }

  validarToken(): Observable<boolean> {
    const token = this.getToken();

    if (!token) {
      return of(false);
    }

    return this.http.get<ValidarTokenResponse>(`${this.apiUrl}/validar-token`).pipe(
      map((response) => response.valido === true)
    );
  }

  buscarUsuarioPorId(id: number): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/usuarios/${id}`).pipe(
      tap((usuario) => {
        this.salvarUsuarioLocal(usuario);
      })
    );
  }

  atualizarPerfil(id: number, payload: {
    nickname: string;
    fotoPerfil: string;
  }): Observable<LoginResponse> {
    return this.http.put<LoginResponse>(`${this.apiUrl}/usuarios/${id}/perfil`, payload).pipe(
      tap((usuario) => {
        this.salvarUsuarioLocal(usuario);
      })
    );
  }

  salvarUsuarioLocal(usuario: LoginResponse | UsuarioLogado): void {
  const usuarioAtual = this.getUsuarioLogado();

  const usuarioParaSalvar: UsuarioLogado = {
    ...usuarioAtual,
    ...usuario
  };

  localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));

  if (usuario.token && usuario.token.startsWith('eyJ')) {
    localStorage.setItem('token', usuario.token);
  }
}

  atualizarUsuarioLogado(usuario: UsuarioLogado): void {
    this.salvarUsuarioLocal(usuario);
  }

  getUsuarioLogado(): UsuarioLogado | null {
    const usuarioStorage = localStorage.getItem('usuarioLogado');

    if (!usuarioStorage) {
      return null;
    }

    try {
      return JSON.parse(usuarioStorage);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  estaLogado(): boolean {
    return !!this.getUsuarioLogado() && !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');
  }
}