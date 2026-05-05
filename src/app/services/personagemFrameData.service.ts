import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonagemFrameData } from '../model/personagemFrameData.model';

@Injectable({
  providedIn: 'root'
})
export class PersonagemFrameDataService {

  private readonly apiUrl = 'http://localhost:8080/personagens';

  constructor(private http: HttpClient) {}

  buscarFrameData(personagemId: number): Observable<PersonagemFrameData[]> {
    return this.http.get<PersonagemFrameData[]>(
      `${this.apiUrl}/${personagemId}/frame-data`
    );
  }
}