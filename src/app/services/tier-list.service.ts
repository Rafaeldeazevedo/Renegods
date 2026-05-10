import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TierListRequest,TierListItemRequest } from '../model/tierList.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TierListService {

  private apiUrl = `${environment.apiUrl}/tier-lists`;

  constructor(private http: HttpClient) {}

  criar(request: TierListRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  listarPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
  excluir(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

  listarPorSeason(season: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/season/${season}`);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}