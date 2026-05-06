import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Personagem } from '../model/personagem.model';



@Injectable({
  providedIn: 'root'
})
export class PersonagemService {
   private apiUrl = 'http://localhost:8080/personagens';

  constructor(private http: HttpClient) {}

    listar(): Observable<Personagem[]> {
    return this.http.get<Personagem[]>(this.apiUrl);
  }

  listarPorUsuario(usuarioId: number): Observable<Personagem[]> {
    return this.http.get<Personagem[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  favoritar(personagemId: number, usuarioId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${personagemId}/favorito/usuario/${usuarioId}`,
      {}
    );
  }

  removerFavorito(personagemId: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${personagemId}/favorito/usuario/${usuarioId}`
    );
  }
}