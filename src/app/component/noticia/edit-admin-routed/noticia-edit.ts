import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NoticiaService } from '../../../service/noticia';
import { INoticia } from '../../../model/noticia';
import { IClub } from '../../../model/club';
import { ClubService } from '../../../service/club';
import { ClubPlistAdminUnrouted } from '../../club/plist-admin-unrouted/club-plist-admin-unrouted';

@Component({
  selector: 'app-noticia-edit-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './noticia-edit.html',
  styleUrl: './noticia-edit.css',
})
export class NoticiaEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private noticiaService = inject(NoticiaService);
  private oClubService = inject(ClubService);
  private snackBar = inject(MatSnackBar);

  noticiaForm!: FormGroup;
  id_noticia = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  clubes = signal<IClub[]>([]);
  selectedClub = signal<IClub | null>(null);
  displayIdClub = signal<number | null>(null);

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClubs();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de noticia no válido');
      this.loading.set(false);
      return;
    }

    this.id_noticia.set(Number(idParam));

    if (isNaN(this.id_noticia())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadNoticia();
  }

  private initForm(): void {
    this.noticiaForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      contenido: ['', [Validators.required, Validators.minLength(3)]],
      fecha: [new Date(), Validators.required],
      imagen: [null],
      id_club: [null, Validators.required],
    });

    this.noticiaForm.get('id_club')?.valueChanges.subscribe((id) => {
      if (id) {
        // Convertir a número si viene como string del select
        const idNumero = typeof id === 'string' ? parseInt(id, 10) : id;
        this.loadClub(idNumero);
      } else {
        this.selectedClub.set(null);
        this.displayIdClub.set(null);
      }
    });
  }

  private loadNoticia(): void {
    this.noticiaService.getById(this.id_noticia()).subscribe({
      next: (noticia: INoticia) => {
        this.noticiaForm.patchValue({
          id: noticia.id,
          titulo: noticia.titulo,
          contenido: noticia.contenido,
          fecha: noticia.fecha,
          id_club: noticia.club?.id,
        });
        if (noticia.club) {
          this.syncClub(noticia.club.id);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la noticia');
        this.snackBar.open('Error cargando la noticia', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private loadClub(idClub: number): void {
    this.displayIdClub.set(idClub);
    const c = this.clubes().find((x) => x.id === idClub) || null;
    this.selectedClub.set(c);
  }

  private syncClub(idClub: number): void {
    this.displayIdClub.set(idClub);
    const c = this.clubes().find((x) => x.id === idClub) || null;
    this.selectedClub.set(c);
  }

  private loadClubs(): void {
    this.oClubService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.clubes.set(page.content);
        const idActual = this.noticiaForm.get('id_club')?.value;
        if (idActual) {
          this.syncClub(idActual);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando clubs', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  get titulo() {
    return this.noticiaForm.get('titulo');
  }

  get contenido() {
    return this.noticiaForm.get('contenido');
  }

  get fecha() {
    return this.noticiaForm.get('fecha');
  }

  get id_club() {
    return this.noticiaForm.get('id_club');
  }

  onSubmit(): void {
    if (this.noticiaForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const noticiaData: any = {
      id: this.id_noticia(),
      titulo: this.noticiaForm.value.titulo,
      contenido: this.noticiaForm.value.contenido,
      fecha: this.noticiaForm.value.fecha,
      imagen: this.noticiaForm.value.imagen || null,
      club: { id: this.noticiaForm.value.id_club },
    };

    // The NoticiaService provided only has getPage/getById/count; assuming update endpoint exists
    // Use HttpClient directly via service if update method exists; otherwise, fall back to patch via getById (not ideal).
    // Try to call (noticiaService as any).update if implemented.
    const maybeUpdate = (this.noticiaService as any).update;
    if (typeof maybeUpdate === 'function') {
      maybeUpdate.call(this.noticiaService, noticiaData).subscribe({
        next: (id: number) => {
          this.snackBar.open('Noticia actualizada exitosamente', 'Cerrar', { duration: 4000 });
          this.submitting.set(false);
          this.router.navigate(['/noticia']);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set('Error actualizando la noticia');
          this.snackBar.open('Error actualizando la noticia', 'Cerrar', { duration: 4000 });
          console.error(err);
          this.submitting.set(false);
        },
      });
    } else {
      // No update method on service: set error and stop submitting
      this.error.set('Servicio de noticia no soporta actualización (update)');
      this.snackBar.open('Acción no soportada en NoticiaService', 'Cerrar', { duration: 4000 });
      this.submitting.set(false);
    }
  }

  openClubFinderModal(): void {
    const dialogRef = this.dialog.open(ClubPlistAdminUnrouted, {
      height: '800px',
      width: '1300px',
      maxWidth: '95vw',
      panelClass: 'club-dialog',
      data: {
        title: 'Aqui elegir club',
        message: 'Plist finder para encontrar el club y asignarlo a la noticia',
      },
    });

    dialogRef.afterClosed().subscribe((club: IClub | null) => {
      if (club) {
        this.noticiaForm.patchValue({
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
}
