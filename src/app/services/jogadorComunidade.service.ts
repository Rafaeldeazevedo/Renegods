import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JogadorComunidadeService {

  private readonly apiUrl = `${environment.apiUrl}/jogadores-comunidade`;

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

  buscarPlayerStyle(jogadorId: number, personagemId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/player-style`
    );
  }

  salvarPlayerStyle(
    jogadorId: number,
    personagemId: number,
    estiloJogo: string
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/player-style`,
      { estiloJogo }
    );
  }

  listarManias(jogadorId: number, personagemId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/manias`
    );
  }

  criarMania(
    jogadorId: number,
    personagemId: number,
    descricao: string
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/manias`,
      { descricao }
    );
  }

  alterarMania(maniaId: number, descricao: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/manias/${maniaId}`,
      { descricao }
    );
  }
  

atualizar(id: number, payload: any) {
  return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
}

  excluirMania(maniaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/manias/${maniaId}`
    );
  }

  contarPlayerStyles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/player-styles/total`);
  }
}