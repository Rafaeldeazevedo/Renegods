import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AtualizarPerfilRequest {
  nickname: string;
  fotoPerfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  atualizarPerfil(usuarioId: number, request: AtualizarPerfilRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${usuarioId}/perfil`, request);
  }
}