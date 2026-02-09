import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CompraService } from '../../../service/compra';
import { ICompra } from '../../../model/compra';
import { DetailAdminUnrouted } from "../detail-admin-unrouted/compra-detail";
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-compra-delete',
  imports: [CommonModule, DetailAdminUnrouted],
  templateUrl: './compra-delete.html',
  styleUrl: './compra-delete.css',
})

export class CompraDeleteAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);
  private oCompraService = inject(CompraService);
  private snackBar = inject(MatSnackBar);

  oCompra = signal<ICompra | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_compra = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_compra.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_compra())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  }

  doDelete() {
    this.oCompraService.delete(this.id_compra()).subscribe({
      next: (data: any) => {
        this.snackBar.open('Compra eliminada', 'Cerrar', { duration: 4000 });
        window.history.back();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando la compra');
        this.snackBar.open('Error eliminando la compra', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  doCancel() {
    window.history.back();
  }
}
