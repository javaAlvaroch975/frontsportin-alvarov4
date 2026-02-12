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
  
  clubs = signal<IClub[]>([]);
  selectedClub = signal<IClub | null>(null);
  displayIdClub = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadClubs();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de tipo de artículo no válido');
      this.loading.set(false);
      return;
    }

    this.id_tipoarticulo.set(Number(idParam));

    if (isNaN(this.id_tipoarticulo())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadTipoarticulo();
  }

  private initForm(): void {
    this.tipoarticuloForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      id_club: [null, Validators.required],
    });

    this.tipoarticuloForm.get('id_club')?.valueChanges.subscribe((id) => {
      if (id) {
        this.syncClub(id);
      }
    });
  }

  private loadTipoarticulo(): void {
    this.oTipoarticuloService.get(this.id_tipoarticulo()).subscribe({
      next: (tipoarticulo: ITipoarticulo) => {
        this.tipoarticuloForm.patchValue({
          id: tipoarticulo.id,
          descripcion: tipoarticulo.descripcion,
          id_club: tipoarticulo.club?.id,
        });
        if (tipoarticulo.club) {
          this.syncClub(tipoarticulo.club.id);
        }
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

  private loadClubs(): void {
    this.oClubService.getPage(0, 100, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.clubs.set(page.content);
        const idActual = this.tipoarticuloForm.get('id_club')?.value;
        if (idActual) {
          this.syncClub(idActual);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando clubes', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private syncClub(idClub: number): void {
    this.displayIdClub.set(idClub);
    const clubSeleccionado = this.clubs().find((c) => c.id === idClub);
    if (clubSeleccionado) {
      this.selectedClub.set(clubSeleccionado);
    } else {
      // Si no está en la lista cargada, podríamos cargarlo individualmente si fuera necesario
      this.oClubService.get(idClub).subscribe({
        next: (club) => this.selectedClub.set(club),
        error: () => this.selectedClub.set(null)
      });
    }
  }

  get descripcion() {
    return this.tipoarticuloForm.get('descripcion');
  }

  get id_club() {
    return this.tipoarticuloForm.get('id_club');
  }

  onSubmit(): void {
    if (this.tipoarticuloForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
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
        this.snackBar.open('Tipo de artículo actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/tipoarticulo']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el tipo de artículo');
        this.snackBar.open('Error actualizando el tipo de artículo', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  doCancel(): void {
    this.router.navigate(['/tipoarticulo']);
  }
}
