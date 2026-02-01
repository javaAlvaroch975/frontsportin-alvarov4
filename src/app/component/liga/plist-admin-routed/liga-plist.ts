import { Component, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { ILiga } from '../../../model/liga';
import { IPage } from '../../../model/plist';
import { LigaService } from '../../../service/liga';
import { HttpErrorResponse } from '@angular/common/http';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { debounceTimeSearch } from '../../../environment/environment';

@Component({
  selector: 'app-liga-plist',
  imports: [Paginacion, BotoneraRpp, RouterLink],
  templateUrl: './liga-plist.html',
  styleUrl: './liga-plist.css',
})
export class LigaPlistAdminRouted implements OnInit, OnDestroy {
  oPage = signal<IPage<ILiga> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);
  rellenaOk = signal<number | null>(null);
  rellenaError = signal<string | null>(null);
  totalElementsCount = signal<number>(0);
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);

  // Variables de ordenamiento
  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');

  // Variables de filtro
  equipo = signal<number>(0);

  // Variables de búsqueda
  nombre = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private oLigaService: LigaService, private route: ActivatedRoute) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('equipo');
    if (id) {
      this.equipo.set(+id);
    }

    // Configurar el debounce para la búsqueda
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(debounceTimeSearch),
        distinctUntilChanged(),
      )
      .subscribe((searchTerm: string) => {
        this.nombre.set(searchTerm);
        this.numPage.set(0);
        this.getPage();
      });

    this.getPage();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getPage() {
    this.oLigaService.getPage(
      this.numPage(),
      this.numRpp(),
      this.orderField(),
      this.orderDirection(),
      this.nombre(),
      this.equipo(),
    ).subscribe({
      next: (data: IPage<ILiga>) => {
        this.oPage.set(data);
        this.totalElementsCount.set(data.totalElements ?? 0);
        this.rellenaOk.set(this.totalElementsCount());

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
    return false;
  }

  goToPage(numPage: number) {
    this.numPage.set(numPage);
    this.getPage();
    return false;
  }

  onRppChange(n: number) {
    this.numRpp.set(n);
    this.numPage.set(0);
    this.getPage();
    return false;
  }

  onSearchName(value: string) {
    this.searchSubject.next(value);
  }
}
