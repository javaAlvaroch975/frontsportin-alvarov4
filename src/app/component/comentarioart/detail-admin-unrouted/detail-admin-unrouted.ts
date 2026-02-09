import { Component, signal, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ComentarioartService } from '../../../service/comentarioart';
import { IComentarioart } from '../../../model/comentarioart';
import { DatetimePipe } from '../../../pipe/datetime-pipe';

@Component({
  selector: 'app-detail-admin-unrouted',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './detail-admin-unrouted.html',
  styleUrl: './detail-admin-unrouted.css',
})
export class ComentarioartDetailAdminUnrouted {

  @Input() id!: number;
  
  private route = inject(ActivatedRoute);
  private oComentarioartService = inject(ComentarioartService);

  oComentarioart = signal<IComentarioart | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log("ID recibido: ", this.id);

    if (!this.id || isNaN(this.id)) {
      this.error.set('ID no valido');
      this.loading.set(false);
      return;
    }
    
    this.load(this.id);
  }

  private load(id: number) {
    this.oComentarioartService.getById(id).subscribe({
      next: (data: IComentarioart) => {
        this.oComentarioart.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el comentario');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
