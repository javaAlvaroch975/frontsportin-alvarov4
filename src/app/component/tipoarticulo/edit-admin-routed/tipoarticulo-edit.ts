import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { ClubService } from '../../../service/club';
import { ITipoarticulo } from '../../../model/tipoarticulo';
import { IClub } from '../../../model/club';
import { MatDialog } from '@angular/material/dialog';
import { ClubPlistAdminUnrouted } from '../../club/plist-admin-unrouted/club-plist-admin-unrouted';

@Component({
  selector: 'app-tipoarticulo-edit-routed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tipoarticulo-edit.html',
  styleUrl: './tipoarticulo-edit.css',
})
export class TipoarticuloEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oTipoarticuloService = inject(TipoarticuloService);
  private oClubService = inject(ClubService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tipoarticuloForm!: FormGroup;
  id_tipoarticulo = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  tipoarticulo = signal<ITipoarticulo | null>(null);
  selectedClub = signal<IClub | null>(null);
  displayIdClub = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id_tipoarticulo.set(+id);
      this.getTipoarticulo(+id);
    } else {
      this.error.set('ID de tipo de artículo no válido');
      this.loading.set(false);
    }
  }

  initForm(): void {
    this.tipoarticuloForm = this.fb.group({
      descripcion: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(255)
      ]],
      id_club: [null, Validators.required],
    });

    // this.tipoarticuloForm.get('id_club')?.valueChanges.subscribe((id) => {
    //   if (id) {
    //     this.syncClub(id);
    //   }
    // });
  }

  private getTipoarticulo(id: number): void {
    this.oTipoarticuloService.get(id).subscribe({
      next: (data: ITipoarticulo) => {
        this.tipoarticulo.set(data);
        this.syncClub(data.club.id);
        this.tipoarticuloForm.patchValue({
          id: data.id,
          descripcion: data.descripcion,
          id_club: data.club?.id,
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el tipo de artículo');
        this.snackBar.open('Error cargando el tipo de artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.tipoarticuloForm.invalid || !this.id_tipoarticulo()) {
      this.tipoarticuloForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const tipoarticuloData: any = {
      id: this.id_tipoarticulo(),
      descripcion: this.tipoarticuloForm.value.descripcion,
      club: { id: this.tipoarticuloForm.value.id_club },
    };

    this.oTipoarticuloService.update(tipoarticuloData).subscribe({
      next: (id: number) => {
        this.submitting.set(false);
        if(this.tipoarticuloForm) {
          this.tipoarticuloForm.markAsPristine();
        }
        this.snackBar.open('Tipo de artículo actualizado exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/tipoarticulo']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set('Error actualizando el tipo de artículo');
        this.snackBar.open('Error actualizando el tipo de artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private syncClub(idClub: number): void {
    this.oClubService.get(idClub).subscribe({
        next: (club: IClub) => {
            this.selectedClub.set(club);
        },
        error: (err: HttpErrorResponse) => {
            console.error('Error al sincronizar club:', err);
            this.snackBar.open('Error al cargar el club seleccionado', 'Cerrar', { duration: 3000 });
        },
    });
  }

  openClubFinderModal(): void {
      const dialogRef = this.dialog.open(ClubPlistAdminUnrouted, {
          height: '800px',
          width: '1100px',
          maxWidth: '95vw',
          panelClass: 'club-dialog',
          data: {
          title: 'Aquí elegir club',
          message: 'Plist finder para encontrar el club y asignarlo a tipo de articulo',
          },
      });

      dialogRef.afterClosed().subscribe((club: IClub | null) => {
          if (club) {
          this.tipoarticuloForm.patchValue({
              id_club: club.id,
          });
          // Sincronizar explícitamente después de seleccionar desde el modal
          this.syncClub(club.id);
          this.snackBar.open(`Club seleccionado: ${club.nombre}`, 'Cerrar', {
              duration: 3000,
          });
          }
      });
  }

  get descripcion() {
    return this.tipoarticuloForm.get('descripcion');
  }

  get id_club() {
    return this.tipoarticuloForm.get('id_club');
  }
}
