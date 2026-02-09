import { Component, Input, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ArticuloService } from '../../../service/articulo';
import { IArticulo } from '../../../model/articulo';

@Component({
  selector: 'app-articulo-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './articulo-detail.html',
  styleUrl: './articulo-detail.css',
})
export class ArticuloDetail implements OnInit {
  @Input() id!: number;

  private oArticuloService = inject(ArticuloService);

  oArticulo = signal<IArticulo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.id || isNaN(this.id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.load(this.id);
  }

  load(id: number) {
    this.oArticuloService.get(id).subscribe({
      next: (data: IArticulo) => {
        this.oArticulo.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el artículo');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
