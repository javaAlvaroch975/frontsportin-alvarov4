import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { CompraService } from '../../../service/compra';
import { ICompra } from '../../../model/compra';

@Component({
  selector: 'app-compra-detail-unrouted',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './compra-detail.html',
  styleUrl: './compra-detail.css',
})
export class DetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);

  private compraService = inject(CompraService);

  oCompra = signal<ICompra | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(this.id());
  }

  load(id: number) {
    this.compraService.get(id).subscribe({
      next: (data: ICompra) => {
        this.oCompra.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la compra');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
