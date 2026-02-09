import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ArticuloService } from '../../../service/articulo';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { IArticulo } from '../../../model/articulo';
import { ITipoarticulo } from '../../../model/tipoarticulo';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { TipoarticuloPlistAdminUnrouted } from '../../tipoarticulo/plist-admin-unrouted/tipoarticulo-plist-admin-unrouted';

@Component({
  selector: 'app-articulo-edit-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './articulo-edit.html',
  styleUrl: './articulo-edit.css',
})
export class ArticuloEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oArticuloService = inject(ArticuloService);
  private oTipoarticuloService = inject(TipoarticuloService);
  private snackBar = inject(MatSnackBar);

  articuloForm!: FormGroup;
  id_articulo = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  tiposarticulo = signal<ITipoarticulo[]>([]);
  selectedTipoarticulo = signal<ITipoarticulo | null>(null);

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTiposArticulo();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de artículo no válido');
      this.loading.set(false);
      return;
    }

    this.id_articulo.set(Number(idParam));

    if (isNaN(this.id_articulo())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadArticulo();
  }

  private initForm(): void {
    this.articuloForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      id_tipoarticulo: [null, Validators.required],
    });
  }

  private loadArticulo(): void {
    this.oArticuloService.get(this.id_articulo()).subscribe({
      next: (articulo: IArticulo) => {
        this.articuloForm.patchValue({
          id: articulo.id,
          descripcion: articulo.descripcion,
          precio: articulo.precio,
          descuento: articulo.descuento,
          id_tipoarticulo: articulo.tipoarticulo?.id,
        });
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

  private loadTiposArticulo(): void {
    this.oTipoarticuloService.getPage(0, 1000, 'descripcion', 'asc').subscribe({
      next: (page) => {
        // Mostrar todos los tipos de artículo con el nombre del club
        this.tiposarticulo.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando tipos de artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  get descripcion() {
    return this.articuloForm.get('descripcion');
  }

  get precio() {
    return this.articuloForm.get('precio');
  }

  get descuento() {
    return this.articuloForm.get('descuento');
  }

  get id_tipoarticulo() {
    return this.articuloForm.get('id_tipoarticulo');
  }

  limitDecimalPlaces(event: Event, fieldName: string, maxDecimals: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > maxDecimals) {
        const truncatedValue = parseFloat(value).toFixed(maxDecimals);
        this.articuloForm
          .get(fieldName)
          ?.setValue(parseFloat(truncatedValue), { emitEvent: false });
        input.value = truncatedValue;
      }
    }
  }

  onSubmit(): void {
    if (this.articuloForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const articuloData: any = {
      id: this.id_articulo(),
      descripcion: this.articuloForm.value.descripcion,
      precio: this.articuloForm.value.precio,
      descuento: this.articuloForm.value.descuento || 0,
      tipoarticulo: { id: this.articuloForm.value.id_tipoarticulo },
    };

    this.oArticuloService.update(articuloData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Artículo actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/articulo']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el artículo');
        this.snackBar.open('Error actualizando el artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  openTipoarticuloFinderModal(): void {
    const dialogRef = this.dialog.open(TipoarticuloPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'tipoarticulo-dialog',
      data: {
        title: 'Aqui elegir tipoarticulo',
        message: 'Plist finder para encontrar el tipoarticulo y asignarlo al articulo',
      },
    });

    dialogRef.afterClosed().subscribe((tipoarticulo: ITipoarticulo | null) => {
      if (tipoarticulo) {
        this.selectedTipoarticulo.set(tipoarticulo);
        this.articuloForm.patchValue({
          id_tipoarticulo: tipoarticulo.id,
        });
        this.snackBar.open(
          `Tipo de artículo seleccionado: ${tipoarticulo.descripcion}`,
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }
}
