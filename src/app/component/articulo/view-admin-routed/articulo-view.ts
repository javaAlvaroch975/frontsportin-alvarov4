import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticuloDetail } from '../articulo-detail/articulo-detail';

@Component({
  selector: 'app-articulo-view',
  imports: [CommonModule, RouterLink, ArticuloDetail],
  templateUrl: './articulo-view.html',
  styleUrl: './articulo-view.css',
})
export class ArticuloViewAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);

  id = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const idValue = idParam ? Number(idParam) : NaN;
    if (!isNaN(idValue)) {
      this.id.set(idValue);
    }
  }
}
