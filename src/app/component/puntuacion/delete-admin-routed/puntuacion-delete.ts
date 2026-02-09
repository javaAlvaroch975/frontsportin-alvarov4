import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PuntuacionService } from '../../../service/puntuacion';
import { IPuntuacion } from '../../../model/puntuacion';
import { PuntuacionDetailAdminUnrouted } from '../detail-admin-unrouted/puntuacion-detail';
// import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-puntuacion-delete',
  imports: [CommonModule, PuntuacionDetailAdminUnrouted],
  templateUrl: './puntuacion-delete.html',
  styleUrl: './puntuacion-delete.css',
})
export class PuntuacionDeleteAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oPuntuacionService = inject(PuntuacionService);
  // private snackBar = inject(MatSnackBar);

  oPuntuacion = signal<IPuntuacion | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_puntuacion = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_puntuacion.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_puntuacion())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.cargarPuntuacion();
  }

  cargarPuntuacion(): void {
    this.oPuntuacionService.get(this.id_puntuacion()).subscribe({
      next: (data: IPuntuacion) => {
        this.oPuntuacion.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error al cargar la puntuación');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  doDelete() {
    this.oPuntuacionService.delete(this.id_puntuacion()).subscribe({
      next: (data: any) => {
        // this.snackBar.open('Puntuación eliminada correctamente', 'Cerrar', { duration: 4000 });
        console.log('Puntuación eliminada');
        this.router.navigate(['/puntuacion']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando la puntuación');
        // this.snackBar.open('Error eliminando la puntuación', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  doCancel() {
    window.history.back();
  }
}
