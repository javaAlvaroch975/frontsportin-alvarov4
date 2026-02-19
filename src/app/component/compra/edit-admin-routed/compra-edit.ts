import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CompraService } from '../../../service/compra';
import { ICompra } from '../../../model/compra';
import { ArticuloService } from '../../../service/articulo';
import { FacturaService } from '../../../service/factura-service';
import { IArticulo } from '../../../model/articulo';
import { IFactura } from '../../../model/factura';
import { ArticuloPlistAdminUnrouted } from '../../articulo/plist-admin-unrouted/articulo-plist-admin-unrouted';
import { FacturaPlistAdminUnrouted } from '../../factura/plist-admin-unrouted/factura-plist';

@Component({
  selector: 'app-compra-edit-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './compra-edit.html',
  styleUrl: './compra-edit.css',
})
export class CompraEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oCompraService = inject(CompraService);
  private oArticuloService = inject(ArticuloService);
  private oFacturaService = inject(FacturaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  compraForm!: FormGroup;
  id_compra = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  selectedArticulo = signal<IArticulo | null>(null);
  selectedFactura = signal<IFactura | null>(null);

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de artículo no válido');
      this.loading.set(false);
      return;
    }

    this.id_compra.set(Number(idParam));

    if (isNaN(this.id_compra())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadCompra();
  }

  private initForm(): void {
    this.compraForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      id_articulo: [null, Validators.required],
      id_factura: [null, Validators.required],
    });
  }

  private loadCompra(): void {
    this.oCompraService.get(this.id_compra()).subscribe({
      next: (compra: ICompra) => {
        this.compraForm.patchValue({
          id: compra.id,
          cantidad: compra.cantidad,
          precio: compra.precio,
          id_articulo: compra.articulo.id,
          id_factura: compra.factura.id,
        });
        this.syncArticulo(compra.articulo.id);
        this.syncFactura(compra.factura.id);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el artículo');
        this.snackBar.open('Error cargando el artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private syncArticulo(idArticulo: number): void {
    this.oArticuloService.get(idArticulo).subscribe({
      next: (articulo: IArticulo) => {
        this.selectedArticulo.set(articulo);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedArticulo.set(null);
        this.snackBar.open('Error al cargar el artículo seleccionado', 'Cerrar', {
          duration: 3000,
        });
        console.error(err);
      },
    });
  }

  private syncFactura(idFactura: number): void {
    this.oFacturaService.get(idFactura).subscribe({
      next: (factura: IFactura) => {
        this.selectedFactura.set(factura);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedFactura.set(null);
        this.snackBar.open('Error al cargar la factura seleccionada', 'Cerrar', { duration: 3000 });
        console.error(err);
      },
    });
  }

  get cantidad() {
    return this.compraForm.get('cantidad');
  }

  get precio() {
    return this.compraForm.get('precio');
  }

  get id_articulo() {
    return this.compraForm.get('id_articulo');
  }

  get id_factura() {
    return this.compraForm.get('id_factura');
  }

  openArticuloFinderModal(): void {
    const dialogRef = this.dialog.open(ArticuloPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'articulo-dialog',
      data: {
        title: 'Aquí elegir artículo',
        message: 'Plist finder para encontrar el artículo y asignarlo a la compra',
      },
    });

    dialogRef.afterClosed().subscribe((articulo: IArticulo | null) => {
      if (articulo) {
        this.compraForm.patchValue({
          id_articulo: articulo.id,
        });
        this.syncArticulo(articulo.id);
        this.snackBar.open(`Artículo seleccionado: ${articulo.descripcion}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  openFacturaFinderModal(): void {
    const dialogRef = this.dialog.open(FacturaPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'factura-dialog',
      data: {
        title: 'Aquí elegir factura',
        message: 'Plist finder para encontrar la factura y asignarla a la compra',
      },
    });

    dialogRef.afterClosed().subscribe((factura: IFactura | null) => {
      if (factura) {
        this.compraForm.patchValue({
          id_factura: factura.id,
        });
        this.syncFactura(factura.id);
        this.snackBar.open(`Factura seleccionada: ${factura.id}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  limitDecimalPlaces(event: Event, fieldName: string, maxDecimals: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > maxDecimals) {
        const truncatedValue = parseFloat(value).toFixed(maxDecimals);
        this.compraForm.get(fieldName)?.setValue(parseFloat(truncatedValue), { emitEvent: false });
        input.value = truncatedValue;
      }
    }
  }

  onSubmit(): void {
    if (this.compraForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const compraData: any = {
      id: this.id_compra(),
      cantidad: this.compraForm.value.cantidad,
      precio: this.compraForm.value.precio,
      articulo: { id: this.compraForm.value.id_articulo },
      factura: { id: this.compraForm.value.id_factura },
    };

    this.oCompraService.update(compraData).subscribe({
      next: (id: number) => {
        this.snackBar.open('compra actualizada exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/compra']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando la compra');
        this.snackBar.open('Error actualizando la compra', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }
}
