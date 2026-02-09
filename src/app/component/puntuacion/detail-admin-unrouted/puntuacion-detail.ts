import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { PuntuacionService } from '../../../service/puntuacion';
import { IPuntuacion } from '../../../model/puntuacion';

@Component({
  selector: 'app-puntuacion-detail-unrouted',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './puntuacion-detail.html',
  styleUrl: './puntuacion-detail.css',
})
export class PuntuacionDetailAdminUnrouted implements OnInit {
  @Input() id: Signal<number> = signal(0);

  private oPuntuacionService = inject(PuntuacionService);

  oPuntuacion = signal<IPuntuacion | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(this.id());
  }

  load(id: number) {
    this.oPuntuacionService.get(id).subscribe({
      next: (data: IPuntuacion) => {
        this.oPuntuacion.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la puntuación');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
