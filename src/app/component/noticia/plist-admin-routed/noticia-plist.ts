import { Component, signal, computed } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { INoticia } from '../../../model/noticia';
import { IPage } from '../../../model/plist';
import { NoticiaService } from '../../../service/noticia';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { TrimPipe } from '../../../pipe/trim-pipe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounceTimeSearch } from '../../../environment/environment';

@Component({
  selector: 'app-noticia-plist',
  standalone: true,
  imports: [Paginacion, BotoneraRpp, DatetimePipe, TrimPipe, RouterLink],
  templateUrl: './noticia-plist.html',
  styleUrl: './noticia-plist.css',
})
export class NoticiaPlistAdminRouted {
  oPage = signal<IPage<INoticia> | null>(null);
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
  club = signal<number>(0);

  // Variables de búsqueda
  titulo = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private oNoticiaService: NoticiaService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Suscribirse a cambios en los parámetros de ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id_club');
      if (id) {
        this.club.set(+id);
      } else {
        this.club.set(0);
      }
      this.numPage.set(0);
      this.getPage();
    });

    // Configurar el debounce para la búsqueda
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(debounceTimeSearch),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.titulo.set(searchTerm);
        this.numPage.set(0);
        this.getPage();
      });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getPage() {
    this.oNoticiaService
      .getPage(
        this.numPage(),
        this.numRpp(),
        this.orderField(),
        this.orderDirection(),
        this.titulo(),
        this.club(),
      )
      .subscribe({
        next: (data: IPage<INoticia>) => {
          this.oPage.set(data);
          if (this.numPage() > 0 && this.numPage() >= data.totalPages) {
            this.numPage.set(data.totalPages - 1);
            this.getPage();
          }
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching data:', error);
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
    this.cdr.detectChanges();
  }

  onRppChange(n: number) {
    this.numRpp.set(n);
    this.numPage.set(0);
    this.getPage();
    this.cdr.detectChanges();
  }

  onSearchTitulo(value: string) {
    this.searchSubject.next(value);
  }
}
