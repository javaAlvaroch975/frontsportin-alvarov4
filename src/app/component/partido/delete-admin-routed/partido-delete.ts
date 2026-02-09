import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';

import { MatSnackBar } from '@angular/material/snack-bar';
import { PartidoDetailAdminUnrouted } from '../detail-admin-unrouted/partido-detail';
import { IPartido } from '../../../model/partido';
import { PartidoService } from '../../../service/partido';

@Component({
  selector: 'app-partido-delete',
  imports: [CommonModule, PartidoDetailAdminUnrouted],
  templateUrl: './partido-delete.html',
  styleUrl: './partido-delete.css',
})

export class PartidoDeleteAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);  
  private oPartidoService = inject(PartidoService);
  private snackBar = inject(MatSnackBar);

  oPartido = signal<IPartido | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_partido = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_partido.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_partido())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }    
  }

  doDelete() {
    this.oPartidoService.delete(this.id_partido()).subscribe({
      next: (data: any) => {
        this.snackBar.open('Partido eliminado', 'Cerrar', { duration: 4000 });
        console.log('Partido eliminado');
        window.history.back();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando el partido');
        this.snackBar.open('Error eliminando el partido', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
  
  doCancel() {    
    window.history.back();
  }




}