import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PagoService } from '../../../service/pago';
import { CuotaService } from '../../../service/cuota';
import { JugadorService } from '../../../service/jugador-service';
import { IPago } from '../../../model/pago';
import { ICuota } from '../../../model/cuota';
import { IJugador } from '../../../model/jugador';
import { CuotaPlistAdminUnrouted } from '../../cuota/plist-admin-unrouted/cuota-plist-admin-unrouted';
import { JugadorPlistAdminUnrouted } from '../../jugador/plist-admin-unrouted/jugador-plist-admin-unrouted';

@Component({
  selector: 'app-pago-edit-admin-routed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pago-edit.html',
  styleUrl: './pago-edit.css',
})
export class PagoEditAdminRouted implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oPagoService = inject(PagoService);
  private oCuotaService = inject(CuotaService);
  private oJugadorService = inject(JugadorService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  pagoForm!: FormGroup;
  pagoId = signal<number | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  submitting = signal<boolean>(false);
  pago = signal<IPago | null>(null);
  
  selectedCuota = signal<ICuota | null>(null);
  selectedJugador = signal<IJugador | null>(null);

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pagoId.set(+id);
      this.getPago(+id);
    } else {
      this.error.set('ID de pago no válido');
      this.loading.set(false);
    }
  }

  initForm(): void {
    this.pagoForm = this.fb.group({
      abonado: [false],
      fecha: ['', [Validators.required]],
      id_cuota: [null, [Validators.required]],
      id_jugador: [null, [Validators.required]],
    });
  }

  getPago(id: number): void {
    this.oPagoService.get(id).subscribe({
      next: (data: IPago) => {
        this.pago.set(data);
        this.syncCuota(data.cuota.id);
        this.syncJugador(data.jugador.id);
        this.pagoForm.patchValue({
          abonado: !!data.abonado,
          fecha: data.fecha ? data.fecha.substring(0, 10) : '',
          id_cuota: data.cuota.id,
          id_jugador: data.jugador.id,
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error al cargar el registro');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (!this.pagoForm.valid || !this.pagoId()) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    
    const fechaForm: string = this.pagoForm.value.fecha;
    const fechaLocalDateTime = fechaForm
      ? (fechaForm.length > 10
          ? fechaForm.replace('T', ' ')
          : `${fechaForm} 00:00:00`)
      : null;

    const payload = {
      id: this.pagoId()!,
      abonado: this.pagoForm.value.abonado ? 1 : 0,
      fecha: fechaLocalDateTime,
      cuota: {
        id: Number(this.pagoForm.value.id_cuota),
      },
      jugador: {
        id: Number(this.pagoForm.value.id_jugador),
      },
    } as unknown as Partial<IPago> & { cuota?: Partial<ICuota>; jugador?: Partial<IJugador> };

    this.oPagoService.update(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        // mark form as pristine so canDeactivate guard won't ask confirmation
        if (this.pagoForm) {
          this.pagoForm.markAsPristine();
        }
        // inform the user
        this.snackBar.open('Se ha guardado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/pago']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set('Error al guardar el registro');
        this.snackBar.open('Error al guardar el registro', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private syncCuota(idCuota: number): void {
    this.oCuotaService.get(idCuota).subscribe({
      next: (cuota: ICuota) => {
        this.selectedCuota.set(cuota);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar cuota:', err);
        this.snackBar.open('Error al cargar la cuota seleccionada', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private syncJugador(idJugador: number): void {
    this.oJugadorService.getById(idJugador).subscribe({
      next: (jugador: IJugador) => {
        this.selectedJugador.set(jugador);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar jugador:', err);
        this.snackBar.open('Error al cargar el jugador seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openCuotaFinderModal(): void {
    const dialogRef = this.dialog.open(CuotaPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'cuota-dialog',
      data: {
        title: 'Seleccionar cuota',
        message: 'Busque y seleccione la cuota para este pago',
      },
    });

    dialogRef.afterClosed().subscribe((cuota: ICuota | null) => {
      if (cuota) {
        this.pagoForm.patchValue({
          id_cuota: cuota.id,
        });
        // Sincronizar explícitamente después de seleccionar desde el modal
        this.syncCuota(cuota.id);
        this.snackBar.open(`Cuota seleccionada: ${cuota.descripcion}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  openJugadorFinderModal(): void {
    const dialogRef = this.dialog.open(JugadorPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'jugador-dialog',
      data: {
        title: 'Seleccionar jugador',
        message: 'Busque y seleccione el jugador para este pago',
      },
    });

    dialogRef.afterClosed().subscribe((jugador: IJugador | null) => {
      if (jugador) {
        this.pagoForm.patchValue({
          id_jugador: jugador.id,
        });
        // Sincronizar explícitamente después de seleccionar desde el modal
        this.syncJugador(jugador.id);
        this.snackBar.open(`Jugador seleccionado: ${jugador.usuario?.nombre} ${jugador.usuario?.apellido1}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  get abonado() {
    return this.pagoForm.get('abonado');
  }

  get fecha() {
    return this.pagoForm.get('fecha');
  }

  get id_cuota() {
    return this.pagoForm.get('id_cuota');
  }

  get id_jugador() {
    return this.pagoForm.get('id_jugador');
  }
}
