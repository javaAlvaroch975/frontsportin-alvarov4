import { Component, inject, signal } from '@angular/core';
import { FacturaDetailAdminUnrouted } from '../detail-admin-unrouted/factura-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FacturaService } from '../../../service/factura-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-admin-routed',
  imports: [FacturaDetailAdminUnrouted],
  templateUrl: './factura-delete.html',
  styleUrl: './factura-delete.css',
})
export class FacturaDeleteAdminRouted {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oFacturaService = inject(FacturaService)
  private snackBar = inject(MatSnackBar);

  id_factura = signal<number>(0);
  deleting = signal<boolean>(false);
  error = signal<string | null>(null);
  


  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const idValue = idParam ? Number(idParam) : NaN;
    if (!isNaN(idValue)) {
      this.id_factura.set(idValue);
    }
  }

   doDelete() {
    this.oFacturaService.delete(this.id_factura()).subscribe({
      next: (data: any) => {
        this.snackBar.open('Factura eliminada', 'Cerrar', { duration: 4000 });
        console.log('Factura eliminada');
        window.history.back();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando el factura');
        this.snackBar.open('Error eliminando el factura', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
  
  doCancel() {    
    window.history.back();
  }
}
