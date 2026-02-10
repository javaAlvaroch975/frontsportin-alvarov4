import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { EquipoService } from '../../../service/equipo';
import { IEquipo } from '../../../model/equipo';

@Component({
  selector: 'app-equipo-detail-unrouted',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './equipo-detail.html',
  styleUrl: './equipo-detail.css',
})

export class EquipoDetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);

  private oEquipoService = inject(EquipoService);
  //private snackBar = inject(MatSnackBar);

  oEquipo = signal<IEquipo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(this.id());
  }

  load(id: number) {
    this.oEquipoService.get(id).subscribe({
      next: (data: IEquipo) => {
        this.oEquipo.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el usuario');
        this.loading.set(false);
        //this.snackBar.open('Error cargando el usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
}
