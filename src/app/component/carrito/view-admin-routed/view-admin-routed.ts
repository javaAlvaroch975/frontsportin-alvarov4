import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { CarritoService } from '../../../service/carrito';
import { ICarrito } from '../../../model/carrito';
import { CarritoDetailAdminUnrouted } from "../detail-admin-unrouted/carrito-detail";


@Component({
  selector: 'app-carrito-view',
  imports: [CommonModule, CarritoDetailAdminUnrouted],
  templateUrl: './view-admin-routed.html',
  styleUrl: './view-admin-routed.css',
})
export class CarritoViewAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);  
  //private snackBar = inject(MatSnackBar);

  oCarrito = signal<ICarrito | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_carrito = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_carrito.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_carrito())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  }
}
