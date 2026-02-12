import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { ComentarioService } from '../../../service/comentario';
import { IComentario } from '../../../model/comentario';
import { ComentarioDetailAdminUnrouted } from "../detail-admin-unrouted/comentario-detail";
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-comentario-view',
  imports: [CommonModule, ComentarioDetailAdminUnrouted],
  templateUrl: './comentario-delete.html',
  styleUrl: './comentario-delete.css',
})

export class ComentarioDeleteAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);  
  private oComentarioService = inject(ComentarioService);
  private snackBar = inject(MatSnackBar);

  oComentario = signal<IComentario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_comentario = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_comentario.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_comentario())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }    
  }

  doDelete() {
    this.oComentarioService.delete(this.id_comentario()).subscribe({
      next: (data: any) => {
        this.snackBar.open('Comentario eliminado', 'Cerrar', { duration: 4000 });
        console.log('Comentario eliminado');
        window.history.back();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando el comentario');
        this.snackBar.open('Error eliminando el comentario', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
  
  doCancel() {    
    window.history.back();
  }




}
