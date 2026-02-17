import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ICuota } from '../../../model/cuota';
import { IEquipo } from '../../../model/equipo';
import { IPage } from '../../../model/plist';
import { CuotaService } from '../../../service/cuota';
import { EquipoService } from '../../../service/equipo';
import { EquipoPlistAdminUnrouted } from '../../equipo/plist-admin-unrouted/equipo-plist-admin-unrouted';

@Component({
  selector: 'app-cuota-edit-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cuota-edit.html',
  styleUrl: './cuota-edit.css',
})
export class CuotaEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oCuotaService = inject(CuotaService);
  private oEquipoService = inject(EquipoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  cuotaForm!: FormGroup;
  id_cuota = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  equipos = signal<IEquipo[]>([]);
  selectedEquipo = signal<IEquipo | null>(null);
  displayIdEquipo = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadEquipos();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de cuota no válido');
      this.loading.set(false);
      return;
    }

    this.id_cuota.set(Number(idParam));

    if (isNaN(this.id_cuota())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadCuota();
  }

  private initForm(): void {
    this.cuotaForm = this.fb.group({
      // id se muestra por separado como readonly (ver template)
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      fecha: ['', [Validators.required]],
      id_equipo: [null, Validators.required],
    });
  }

  private loadCuota(): void {
    this.oCuotaService.get(this.id_cuota()).subscribe({
      next: (cuota: ICuota) => {
        this.cuotaForm.patchValue({
          descripcion: cuota.descripcion,
          cantidad: cuota.cantidad,
          // si viene con ISO completo, nos quedamos con YYYY-MM-DD para <input type="date">
          fecha: cuota.fecha ? cuota.fecha.substring(0, 10) : '',
          id_equipo: cuota.equipo?.id ?? null,
        });
        this.id_cuota.set(cuota.id ?? 0);
        if (cuota.equipo?.id) {
          this.syncEquipo(cuota.equipo.id);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la cuota');
        this.snackBar.open('Error cargando la cuota', 'Cerrar', {
          duration: 4000,
        });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private syncEquipo(idEquipo: number): void {
    this.oEquipoService.get(idEquipo).subscribe({
      next: (equipo: IEquipo) => {
        this.selectedEquipo.set(equipo);
        this.displayIdEquipo.set(equipo.id ?? null);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar equipo:', err);
        this.snackBar.open('Error al cargar el equipo seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openEquipoFinderModal(): void {
    const dialogRef = this.dialog.open(EquipoPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'equipo-dialog',
      data: {
        title: 'Aquí elegir equipo',
        message: 'Plist finder para encontrar el equipo y asignarlo a la cuota',
      },
    });

    dialogRef.afterClosed().subscribe((equipo: IEquipo | null) => {
      if (equipo) {
        this.cuotaForm.patchValue({ id_equipo: equipo.id });
        // sincronizar datos del equipo seleccionado
        this.syncEquipo(equipo.id!);
        this.snackBar.open(`Equipo seleccionado: ${equipo.nombre}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  private loadEquipos(): void {
    this.oEquipoService.getPage(0, 1000, 'nombre', 'asc', '', 0, 0).subscribe({
      next: (page: IPage<IEquipo>) => {
        this.equipos.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando equipos', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  get descripcion() {
    return this.cuotaForm.get('descripcion');
  }

  get cantidad() {
    return this.cuotaForm.get('cantidad');
  }

  get fecha() {
    return this.cuotaForm.get('fecha');
  }

  get id_equipo() {
    return this.cuotaForm.get('id_equipo');
  }

  limitDecimalPlaces(event: Event, fieldName: string, maxDecimals: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > maxDecimals) {
        const truncatedValue = parseFloat(value).toFixed(maxDecimals);
        this.cuotaForm.get(fieldName)?.setValue(parseFloat(truncatedValue), { emitEvent: false });
        input.value = truncatedValue;
      }
    }
  }

  onSubmit(): void {
    if (this.cuotaForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      this.cuotaForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    /* El backend espera `java.time.LocalDateTime`.
		Desde el input type="date" recibimos YYYY-MM-DD.
		Por el log del backend, el formato esperado es: "YYYY-MM-DD HH:mm:ss" (con espacio, no con 'T'). */
    const fechaForm: string = this.cuotaForm.value.fecha;
    const fechaLocalDateTime = fechaForm
      ? fechaForm.length > 10
        ? fechaForm.replace('T', ' ')
        : `${fechaForm} 00:00:00`
      : null;

    const cuotaData: any = {
      id: this.id_cuota(),
      descripcion: this.cuotaForm.value.descripcion,
      cantidad: this.cuotaForm.value.cantidad,
      fecha: fechaLocalDateTime,
      equipo: { id: this.cuotaForm.value.id_equipo },
    };

    this.oCuotaService.update(cuotaData).subscribe({
      next: () => {
        this.snackBar.open('Cuota actualizada exitosamente', 'Cerrar', {
          duration: 4000,
        });
        this.submitting.set(false);
        this.router.navigate(['/cuota']);
      },
      error: (err: HttpErrorResponse) => {
        const serverMsg =
          (typeof err.error === 'string' && err.error) ||
          err.error?.message ||
          err.message ||
          'Error actualizando la cuota';

        this.error.set(serverMsg);
        this.snackBar.open(serverMsg, 'Cerrar', { duration: 6000 });
        console.error('[CuotaEdit] update error', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
        });
        this.submitting.set(false);
      },
    });
  }
}
