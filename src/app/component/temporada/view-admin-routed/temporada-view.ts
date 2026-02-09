import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TemporadaDetailAdminUnrouted } from '../detail-admin-unrouted/temporada-detail';

@Component({
  selector: 'app-temporada-view',
  imports: [CommonModule, RouterLink, TemporadaDetailAdminUnrouted],
  templateUrl: './temporada-view.html',
  styleUrl: './temporada-view.css',
})
export class TemporadaViewAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  
  id_temporada = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_temporada.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_temporada())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.loading.set(false);
  }
}
