import { Component, signal, computed } from '@angular/core';
import { ITemporada } from '../../../model/temporada';
import { IPage } from '../../../model/plist';
import { TemporadaService } from '../../../service/temporada';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { TrimPipe } from '../../../pipe/trim-pipe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounceTimeSearch } from '../../../environment/environment';

@Component({
  selector: 'app-temporada-plist',
  imports: [Paginacion, BotoneraRpp, TrimPipe, RouterLink],
  templateUrl: './temporada-plist.html',
  styleUrl: './temporada-plist.css',
})
export class TemporadaPlist {
  oPage = signal<IPage<ITemporada> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);
  rellenaCantidad = signal<number>(10);
  rellenando = signal<boolean>(false);
  rellenaOk = signal<number | null>(null);
  rellenaError = signal<string | null>(null);
  publishingId = signal<number | null>(null);
  publishingAction = signal<'publicar' | 'despublicar' | null>(null);

  // Mensajes y total
  message = signal<string | null>(null);
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);
  private messageTimeout: any = null;

  // Variables de ordenamiento
  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');

  // Variables de filtro
  club = signal<number>(0);

  // Variables de búsqueda
  descripcion = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private oTemporadaService: TemporadaService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('club');
    if (id) {
      this.club.set(+id);
    }

    const msg = this.route.snapshot.queryParamMap.get('msg');
    if (msg) {
      this.showMessage(msg);
    }

    // Configurar el debounce para la búsqueda
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(debounceTimeSearch), // Espera 800ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo emite si el valor cambió
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

  private showMessage(msg: string, duration: number = 4000) {
    this.message.set(msg);
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = setTimeout(() => {
      this.message.set(null);
      this.messageTimeout = null;
    }, duration);
  }

  getPage() {
    this.oTemporadaService
      .getPage(
        this.numPage(),
        this.numRpp(),
        this.orderField(),
        this.orderDirection(),
        this.descripcion(),
        this.club(),
      )
      .subscribe({
        next: (data: IPage<ITemporada>) => {
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
    // Emitir el valor al Subject para que sea procesado con debounce
    this.searchSubject.next(value);
  }
}
