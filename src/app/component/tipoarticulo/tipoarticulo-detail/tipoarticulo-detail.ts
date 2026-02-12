import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { ITipoarticulo } from '../../../model/tipoarticulo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tipoarticulo-detail',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './tipoarticulo-detail.html',
  styleUrl: './tipoarticulo-detail.css',
})
export class TipoarticuloDetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);

  private oTipoarticuloService = inject(TipoarticuloService);
  private snackBar = inject(MatSnackBar);

  oTipoarticulo = signal<ITipoarticulo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(this.id());
  }

  load(id: number) {
    this.oTipoarticuloService.get(id).subscribe({
      next: (data: ITipoarticulo) => {
        this.oTipoarticulo.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el tipo de artículo');
        this.loading.set(false);
        this.snackBar.open('Error cargando el tipo de artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
}
