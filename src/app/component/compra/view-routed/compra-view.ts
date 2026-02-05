import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { CompraService } from '../../../service/compra';
import { ICompra } from '../../../model/compra';

@Component({
  selector: 'app-compra-view',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './compra-view.html',
  styleUrl: './compra-view.css',
})
export class CompraViewRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private compraService = inject(CompraService);

  oCompra = signal<ICompra | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.load(id);
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
