import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JogadorComunidadeService {

  private readonly apiUrl = 'http://localhost:8080/jogadores-comunidade';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  cadastrar(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  listarPersonagensDoJogador(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/personagens`);
  }
}