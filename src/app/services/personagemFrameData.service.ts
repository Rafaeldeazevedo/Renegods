import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonagemFrameData } from '../model/personagemFrameData.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonagemFrameDataService {

  private readonly apiUrl = `${environment.apiUrl}/personagens`;

  constructor(private http: HttpClient) {}

  buscarFrameData(personagemId: number): Observable<PersonagemFrameData[]> {
    return this.http.get<PersonagemFrameData[]>(
      `${this.apiUrl}/${personagemId}/frame-data`
    );
  }
}