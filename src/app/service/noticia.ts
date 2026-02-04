import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
import { Observable } from 'rxjs';
import { INoticia } from '../model/noticia';

@Injectable({
  providedIn: 'root',
})

export class NoticiaService {

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    rpp: number,
    order: string = '',
    direction: string = '',
    titulo: string = '',
    id_club: number = 0,
  ): Observable<IPage<INoticia>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    
    // Filtro por club.id
    if (id_club > 0) {
      return this.oHttp.get<IPage<INoticia>>(
        serverURL +
          `/noticia?page=${page}&size=${rpp}&sort=${order},${direction}&id_club=${id_club}`,
      );
    }
    
    // Búsqueda por título o contenido (usa el mismo valor para ambos campos)
    if (titulo && titulo.length > 0) {
      return this.oHttp.get<IPage<INoticia>>(
        serverURL +
          `/noticia?page=${page}&size=${rpp}&sort=${order},${direction}&titulo=${titulo}&contenido=${titulo}`,
      );
    }
    
    // Sin filtros
    return this.oHttp.get<IPage<INoticia>>(
      serverURL + `/noticia?page=${page}&size=${rpp}&sort=${order},${direction}`,
    );
  }

  getById(id: number): Observable<INoticia> {
    return this.oHttp.get<INoticia>(
      serverURL + `/noticia/${id}`
    );
  }

  count(): Observable<number> {
    return this.oHttp.get<number>(serverURL + '/noticia/count');
  }
}
