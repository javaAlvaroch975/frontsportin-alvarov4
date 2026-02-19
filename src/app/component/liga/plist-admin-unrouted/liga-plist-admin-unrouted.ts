import { Component, computed, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { debounceTimeSearch } from '../../../environment/environment';
import { ILiga } from '../../../model/liga';
import { IPage } from '../../../model/plist';
import { LigaService } from '../../../service/liga';

import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraActionsPlist } from '../../shared/botonera-actions-plist/botonera-actions-plist';

@Component({
  selector: 'app-liga-plist-admin-unrouted',
  imports: [BotoneraRpp, Paginacion, RouterLink, BotoneraActionsPlist],
  templateUrl: './liga-plist-admin-unrouted.html',
  styleUrls: ['./liga-plist-admin-unrouted.css'],
  standalone: true,
})
export class LigaPlistAdminUnrouted {
  // filtro opcional para equipo
  @Input() equipo = signal<number>(0);

  oPage = signal<IPage<ILiga> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);

  // Mensajes y total
  message = signal<string | null>(null);
  totalRecords = computed(() => this.oPage()?.totalElements ?? 0);
  private messageTimeout: any = null;

  // orden
  orderField = signal<string>('id');
  orderDirection = signal<'asc' | 'desc'>('asc');

  // búsqueda
  nombre = signal<string>('');
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private oLigaService = inject(LigaService);
  private route = inject(ActivatedRoute);
  private dialogRef = inject(MatDialogRef<LigaPlistAdminUnrouted>, { optional: true });

  ngOnInit(): void {
    const msg = this.route.snapshot.queryParamMap.get('msg');
    if (msg) {
      this.showMessage(msg);
    }

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(debounceTimeSearch), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.nombre.set(searchTerm);
        this.numPage.set(0);
        this.getPage();
      });

    this.getPage();
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

  getPage(): void {
    this.oLigaService
      .getPage(
        this.numPage(),
        this.numRpp(),
        this.orderField(),
        this.orderDirection(),
        this.nombre(),
        this.equipo(),
      )
      .subscribe({
        next: (data: IPage<ILiga>) => {
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

  onRppChange(n: number) {
    this.numRpp.set(n);
    this.numPage.set(0);
    this.getPage();
  }

  goToPage(numPage: number) {
    this.numPage.set(numPage);
    this.getPage();
  }

  onSearchNombre(value: string) {
    this.searchSubject.next(value);
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

  isDialogMode(): boolean {
    return !!this.dialogRef;
  }

  onSelect(liga: ILiga): void {
    this.dialogRef?.close(liga);
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
