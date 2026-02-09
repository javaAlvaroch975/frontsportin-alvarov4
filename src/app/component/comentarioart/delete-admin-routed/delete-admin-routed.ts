import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ComentarioartService } from '../../../service/comentarioart';
import { IComentarioart } from '../../../model/comentarioart';
import { ComentarioartDetailAdminUnrouted } from '../detail-admin-unrouted/detail-admin-unrouted';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-admin-routed',
  standalone: true,
  imports: [CommonModule, ComentarioartDetailAdminUnrouted],
  templateUrl: './delete-admin-routed.html',
  styleUrl: './delete-admin-routed.css',
})
export class ComentarioartDeleteAdminRouted {
  
  id!: number;

  private route = inject(ActivatedRoute);  
  private oComentarioartService = inject(ComentarioartService);
  private snackBar = inject(MatSnackBar);

  oComentarioart = signal<IComentarioart | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
    });
  }

  doDelete() {
    this.oComentarioartService.delete(this.id).subscribe({
      next: (data: any) => {
        this.snackBar.open('Comentario de artículo eliminado', 'Cerrar', { duration: 4000 });
        console.log('Comentarioart eliminado');
        window.history.back();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando el comentario de artículo');
        this.snackBar.open('Error eliminando el comentario de artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
  
  doCancel() {    
    window.history.back();
  }
}
