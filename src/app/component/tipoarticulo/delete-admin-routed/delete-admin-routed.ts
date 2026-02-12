import { Component, inject, signal } from '@angular/core';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TipoarticuloDetailAdminUnrouted } from '../tipoarticulo-detail/tipoarticulo-detail';

@Component({
  selector: 'app-delete-admin-routed',
  imports: [TipoarticuloDetailAdminUnrouted],
  templateUrl: './delete-admin-routed.html',
  styleUrl: './delete-admin-routed.css',
})
export class TipoarticuloDeleteAdminRouted {
  private route = inject(ActivatedRoute);
  private oTipoarticuloService = inject(TipoarticuloService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  error = signal<string | null>(null);
  idTipoarticulo = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idTipoarticulo.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.idTipoarticulo())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  }

  doDelete() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idTipoarticulo.set(idParam ? Number(idParam) : NaN);

    this.oTipoarticuloService.delete(this.idTipoarticulo()).subscribe({
      next: () => {
        this.snackBar.open('Tipo de articulo eliminado', 'Cerrar', { duration: 4000 });
        window.history.back();
      },
      error: () => {
        this.error.set('Error eliminando el tipo de articulo');
        this.snackBar.open(this.error()!, 'Cerrar', { duration: 4000 });
      },
    });
  }

  doCancel() {
    window.history.back();
  }
}
