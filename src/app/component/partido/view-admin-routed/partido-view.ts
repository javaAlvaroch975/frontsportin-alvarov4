import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IPartido } from '../../../model/partido';
import { PartidoDetailAdminUnrouted } from '../detail-admin-unrouted/partido-detail';




@Component({
  selector: 'app-partido-view',
  imports: [CommonModule, PartidoDetailAdminUnrouted],
  templateUrl: './partido-view.html',
  styleUrl: './partido-view.css',
})
export class PartidoViewAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);

  oPartido = signal<IPartido | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_partido = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_partido.set(idParam ? Number(idParam) : 0);
    if (isNaN(this.id_partido())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  
  }
}
