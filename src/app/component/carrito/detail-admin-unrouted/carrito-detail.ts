import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { CarritoService } from '../../../service/carrito';
import { ICarrito } from '../../../model/carrito';

@Component({
  selector: 'app-carrito-detail-unrouted',
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito-detail.html',
  styleUrl: './carrito-detail.css',
})

export class CarritoDetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);
  
  private oCarritoService = inject(CarritoService);
  //private snackBar = inject(MatSnackBar);

  oCarrito = signal<ICarrito | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {  
    this.load(this.id());
  }

  load(id: number) {
    this.oCarritoService.getById(id).subscribe({
      next: (data: ICarrito) => {
        this.oCarrito.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el carrito');
        this.loading.set(false);
        //this.snackBar.open('Error cargando el usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
}
