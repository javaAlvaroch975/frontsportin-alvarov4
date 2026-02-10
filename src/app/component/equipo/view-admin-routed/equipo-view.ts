import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IEquipo } from '../../../model/equipo';
import { EquipoDetailAdminUnrouted } from "../detail-admin-unrouted/equipo-detail";


@Component({
  selector: 'app-equipo-view',
  imports: [CommonModule, EquipoDetailAdminUnrouted],
  templateUrl: './equipo-view.html',
  styleUrl: './equipo-view.css',
})
export class EquipoViewRouted implements OnInit {
  private route = inject(ActivatedRoute);
  //private snackBar = inject(MatSnackBar);

  oEquipo = signal<IEquipo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_equipo = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_equipo.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_equipo())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  }
}
