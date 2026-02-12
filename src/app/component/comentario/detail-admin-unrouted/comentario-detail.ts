import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { ComentarioService } from '../../../service/comentario';
import { IComentario } from '../../../model/comentario';

@Component({
  selector: 'app-comentario-detail-unrouted',
  imports: [CommonModule, RouterLink],
  templateUrl: './comentario-detail.html',
  styleUrl: './comentario-detail.css',
})

export class ComentarioDetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);
  
  private oComentarioService = inject(ComentarioService);
  //private snackBar = inject(MatSnackBar);

  oComentario = signal<IComentario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {  
    this.load(this.id());
  }

  load(id: number) {
    this.oComentarioService.get(id).subscribe({
      next: (data: IComentario) => {
        this.oComentario.set(data);
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
