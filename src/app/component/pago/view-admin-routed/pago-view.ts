import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { PagoService } from '../../../service/pago';
import { IPago } from '../../../model/pago';
import { PagoDetailAdminUnrouted } from "../detail-admin-unrouted/pago-detail";


@Component({
  selector: 'app-pago-view',
  imports: [CommonModule, PagoDetailAdminUnrouted],
  templateUrl: './pago-view.html',
  styleUrl: './pago-view.css',
})
export class PagoViewAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);  
  //private snackBar = inject(MatSnackBar);

  oPago = signal<IPago | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_pago = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_pago.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_pago())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }    
  }
}
