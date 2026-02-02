import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverURL } from '../environment/environment';
import { ITipousuario } from '../model/tipousuario';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class TipousuarioService {
    constructor(private httpClient: HttpClient) { }
 
    getAll(): Observable<ITipousuario[]> {
        return this.httpClient.get<ITipousuario[]>(`${serverURL}/tipousuario`);
    }
}
