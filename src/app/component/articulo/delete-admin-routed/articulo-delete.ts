import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticuloDetail } from '../articulo-detail/articulo-detail';
import { ArticuloService } from '../../../service/articulo';

@Component({
  selector: 'app-articulo-delete',
  imports: [CommonModule, RouterLink, ArticuloDetail],
  templateUrl: './articulo-delete.html',
  styleUrl: './articulo-delete.css',
})
export class ArticuloDeleteAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oArticuloService = inject(ArticuloService);

  id = signal<number>(0);
  articulo = signal<any | null>(null);
  deleting = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const idValue = idParam ? Number(idParam) : NaN;
    if (!isNaN(idValue)) {
      this.id.set(idValue);
      // Cargar artículo para mostrar contadores relacionados
      this.oArticuloService.get(idValue).subscribe({
        next: (data) => {
          this.articulo.set(data);
        },
        error: (err) => {
          // Silencioso: mostrará error si intenta borrar
          this.error.set(err?.message ?? 'No se pudo cargar el artículo');
        },
      });
    }
  }

  delete(): void {
    if (this.id() <= 0) {
      this.error.set('ID de artículo inválido');
      return;
    }
    // Si hay registros relacionados, preguntar confirmación mostrando conteos
    const art = this.articulo();
    const comentarios = art?.comentarioarts ?? 0;
    const compras = art?.compras ?? 0;
    const carritos = art?.carritos ?? 0;
    const afect = comentarios + compras + carritos;

    // Solo preguntar confirmación si realmente afecta a otros registros
    if (afect > 0) {
      const confirmMessage = `¿Seguro que quieres eliminar este registro? Afectarás a ${comentarios} comentario(s), ${compras} compra(s) y ${carritos} carrito(s).`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    this.deleting.set(true);
    this.error.set(null);
    this.oArticuloService.delete(this.id()).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/articulo']);
      },
      error: (err) => {
        this.deleting.set(false);
        // err may be HttpErrorResponse
        this.error.set(err?.error?.message ?? err?.message ?? 'Error desconocido al eliminar');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/articulo']);
  }
}
