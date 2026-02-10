import { Component, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { TrimPipe } from '../../../pipe/trim-pipe';

import { EquipoService } from '../../../service/equipo';
import { debounceTimeSearch } from '../../../environment/environment';
import { IPage } from '../../../model/plist';
import { IEquipo } from '../../../model/equipo';

@Component({
  selector: 'app-plist-equipo',
  imports: [Paginacion, BotoneraRpp, TrimPipe, RouterLink],
  templateUrl: './equipo-plist.html',
  styleUrl: './equipo-plist.css',
})
export class PlistEquipo {
  oPage = signal<IPage<IEquipo> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);

  // Mensajes y total
  message = signal<string | null>(null);
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);
  private messageTimeout: any = null;

  // Variables de ordenamiento
  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');

  // Variables de filtro
  categoria = signal<number>(0);
  usuario = signal<number>(0);

  // Variables de búsqueda
  nombre = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  // Cache to avoid refetching the large page on every keystroke
  private cachedAll: IEquipo[] | null = null;

  constructor(
    private oEquipoService: EquipoService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id_categoria');
    if (id) {
      this.categoria.set(+id);
    }

    const idUsuario = this.route.snapshot.paramMap.get('id_usuario');
    if (idUsuario) {
      this.usuario.set(+idUsuario);
    }

    // Configurar el debounce para la búsqueda
    // Búsqueda inmediata: emitimos al momento (solo distinctUntilChanged para evitar llamadas repetidas con mismo término)
    this.searchSubscription = this.searchSubject
      .pipe(distinctUntilChanged())
      .subscribe((searchTerm: string) => {
        this.nombre.set(searchTerm);
        this.numPage.set(0);
        // No clear cache here; getPage gestionará si necesita fetch o filtrar localmente
        this.getPage();
      });

    this.getPage();
  }

  ngOnDestroy() {
    // Limpiar la suscripción para evitar memory leaks
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getPage() {
    // Si hay un nombre de búsqueda, el backend no lo aplica correctamente en este API,
    // así que traemos un page grande y filtramos en cliente por nombre (case insensitive),
    // luego paginamos el resultado localmente.
    if (this.nombre() && this.nombre().trim().length > 0) {
      const searchTerm = this.nombre().trim().toLowerCase();

      const buildAndSetLocalPage = (all: IEquipo[]) => {
        const filtered = all.filter((e) => (e.nombre || '').toLowerCase().includes(searchTerm));

        const totalElements = filtered.length;
        const size = this.numRpp();
        const totalPages = Math.max(1, Math.ceil(totalElements / size));
        const page = Math.min(this.numPage(), totalPages - 1);
        const start = page * size;
        const pageContent = filtered.slice(start, start + size);

        const localPage: IPage<IEquipo> = {
          content: pageContent,
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { sorted: true, unsorted: false, empty: false },
            offset: start,
            paged: true,
            unpaged: false,
          },
          totalPages: totalPages,
          totalElements: totalElements,
          last: page === totalPages - 1,
          size: size,
          number: page,
          sort: { sorted: true, unsorted: false, empty: false },
          first: page === 0,
          numberOfElements: pageContent.length,
          empty: pageContent.length === 0,
        };

        this.oPage.set(localPage);
      };

      if (this.cachedAll) {
        // Filtrar en cliente usando cache
        buildAndSetLocalPage(this.cachedAll);
        return;
      }

      // Si no hay cache, traer un page grande que contenga todos los posibles registros del backend
      this.oEquipoService
        .getPage(0, 1000, this.orderField(), this.orderDirection(), '', this.categoria(), this.usuario())
        .subscribe({
          next: (data: IPage<IEquipo>) => {
            this.cachedAll = data.content || [];
            buildAndSetLocalPage(this.cachedAll);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
      return;
    }

    // Si no hay término de búsqueda, consultamos al backend normalmente
    this.oEquipoService
      .getPage(
        this.numPage(),
        this.numRpp(),
        this.orderField(),
        this.orderDirection(),
        '',
        this.categoria(),
        this.usuario()
      )
      .subscribe({
        next: (data: IPage<IEquipo>) => {
          this.oPage.set(data);
          if (this.numPage() > 0 && this.numPage() >= data.totalPages) {
            this.numPage.set(data.totalPages - 1);
            this.getPage();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  onOrder(order: string) {
    if (this.orderField() === order) {
      this.orderDirection.set(this.orderDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.orderField.set(order);
      this.orderDirection.set('asc');
    }
    // Cambiar orden invalida la cache local de resultados de búsqueda
    this.cachedAll = null;
    this.numPage.set(0);
    this.getPage();
  }

  goToPage(numPage: number) {
    this.numPage.set(numPage);
    this.getPage();
  }

  onRppChange(n: number) {
    this.numRpp.set(n);
    this.numPage.set(0);
    this.getPage();
  }

  onSearchNombre(value: string) {
    // Emitir el valor al Subject para procesamiento inmediato
    // Si el valor queda vacío, limpiar la cache para que la próxima consulta venga del servidor
    if (!value || value.trim().length === 0) {
      this.cachedAll = null;
    }
    this.searchSubject.next(value);
  }
}
