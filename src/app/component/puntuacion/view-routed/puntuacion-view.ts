import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PuntuacionDetailAdminUnrouted } from '../detail-admin-unrouted/puntuacion-detail';

@Component({
  selector: 'app-view-routed',
  imports: [CommonModule, PuntuacionDetailAdminUnrouted],
  templateUrl: './puntuacion-view.html',
  styleUrls: ['./puntuacion-view.css'],
})
export class PuntuacionViewRouted implements OnInit {
  private route = inject(ActivatedRoute);

  loading = signal(true);
  error = signal<string | null>(null);
  id_puntuacion = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_puntuacion.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_puntuacion())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.loading.set(false);
  }
}
