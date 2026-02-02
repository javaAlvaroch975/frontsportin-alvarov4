import { Component, signal, computed, effect } from '@angular/core';
import { ICuota } from '../../../model/cuota';
import { IPage } from '../../../model/plist';
import { CuotaService } from '../../../service/cuota';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { TrimPipe } from '../../../pipe/trim-pipe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounceTimeSearch } from '../../../environment/environment';

@Component({
  selector: 'app-cuota-plist',
imports: [Paginacion, BotoneraRpp, DatetimePipe, TrimPipe, RouterLink],
  templateUrl: './cuota-plist.html',
  styleUrl: './cuota-plist.css',
})
export class CuotaPlistAdminRouted {
  oPage = signal<IPage<ICuota> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);
  rellenaCantidad = signal<number>(10);
  rellenando = signal<boolean>(false);
  rellenaOk = signal<number | null>(null);
  rellenaError = signal<string | null>(null);
  publishingId = signal<number | null>(null);
  publishingAction = signal<'publicar' | 'despublicar' | null>(null);

  message = signal<string | null>(null);
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);
  private messageTimeout: any = null;

  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');

  //variables de filtro
  equipo = signal<number>(0);

  //variables de búsqueda
  descripcion = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private oCuotaService: CuotaService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('equipo');
    if (id) {
      this.equipo.set(+id);
    }

    //Configurar el debounce para la búsqueda
    this.searchSubscription = this.searchSubject
    .pipe(
      debounceTime(debounceTimeSearch),
      distinctUntilChanged(),
    )
    .subscribe((searchTerm: string) => {
      this.descripcion.set(searchTerm);
      this.numPage.set(0);
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
    this.oCuotaService
      .getPage(
        this.numPage(),
        this.numRpp(), 
        this.orderField(), 
        this.orderDirection(),
      this.descripcion(),
      this.equipo(),
      )
      .subscribe({
        next: (data: IPage<ICuota>) => {
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

  onCantidadChange(value: string) {
    this.rellenaCantidad.set(+value);
  }

  onSearchDescription(value: string) {
    this.searchSubject.next(value);
  }
}
