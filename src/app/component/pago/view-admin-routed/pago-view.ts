import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { PagoService } from '../../../service/pago';
import { IPago } from '../../../model/pago';


@Component({
  selector: 'app-pago-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-view.html',
  styleUrl: './pago-view.css',
})
export class PagoViewAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private oPagoService = inject(PagoService);
  //private snackBar = inject(MatSnackBar);

  oPago = signal<IPago | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
    this.load(id);
  }

  load(id: number) {
    this.oPagoService.get(id).subscribe({
      next: (data: IPago) => {
        this.oPago.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el usuario');
        this.loading.set(false);
        //this.snackBar.open('Error cargando el usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
}
