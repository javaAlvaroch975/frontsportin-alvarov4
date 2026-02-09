import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TemporadaService } from '../../../service/temporada';
import { ITemporada } from '../../../model/temporada';
import { TemporadaDetailAdminUnrouted } from "../detail-admin-unrouted/temporada-detail";
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-temporada-delete',
  imports: [CommonModule, TemporadaDetailAdminUnrouted],
  templateUrl: './temporada-delete.html',
  styleUrl: './temporada-delete.css',
})

export class TemporadaDeleteAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);  
  private router = inject(Router);
  private oTemporadaService = inject(TemporadaService);
  private snackBar = inject(MatSnackBar);

  oTemporada = signal<ITemporada | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_temporada = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_temporada.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_temporada())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.cargarTemporada();
  }

  cargarTemporada(): void {
    this.oTemporadaService.get(this.id_temporada()).subscribe({
      next: (data: ITemporada) => {
        this.oTemporada.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error al cargar la temporada');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  tieneCategorias(): boolean {
    return (this.oTemporada()?.categorias ?? 0) > 0;
  }

  doDelete() {
    this.oTemporadaService.delete(this.id_temporada()).subscribe({
      next: (data: any) => {
        this.snackBar.open('Temporada eliminada correctamente', 'Cerrar', { duration: 4000 });
        console.log('Temporada eliminada');
        this.router.navigate(['/temporada']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando la temporada');
        this.snackBar.open('Error eliminando la temporada', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
  
  doCancel() {    
    window.history.back();
  }
}
