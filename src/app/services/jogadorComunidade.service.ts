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

 buscarPlayerStyle(jogadorId: number, personagemId: number) {
  return this.http.get<any>(
    `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/player-style`
  );
}

salvarPlayerStyle(jogadorId: number, personagemId: number, estiloJogo: string) {
  return this.http.put<any>(
    `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/player-style`,
    { estiloJogo }
  );
}

listarManias(jogadorId: number, personagemId: number) {
  return this.http.get<any[]>(
    `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/manias`
  );
}

criarMania(jogadorId: number, personagemId: number, descricao: string) {
  return this.http.post<any>(
    `${this.apiUrl}/${jogadorId}/personagens/${personagemId}/manias`,
    { descricao }
  );
}

alterarMania(maniaId: number, descricao: string) {
  return this.http.put<any>(
    `${this.apiUrl}/manias/${maniaId}`,
    { descricao }
  );
}

excluirMania(maniaId: number) {
  return this.http.delete<void>(
    `${this.apiUrl}/manias/${maniaId}`
  );
}
}