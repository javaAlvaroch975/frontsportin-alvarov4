import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EquipoService } from '../../../service/equipo';
import { CategoriaService } from '../../../service/categoria';
import { UsuarioService } from '../../../service/usuarioService';
import { ICategoria } from '../../../model/categoria';
import { IUsuario } from '../../../model/usuario';
import { IEquipo } from '../../../model/equipo';
import { CategoriaPlistAdminUnrouted } from '../../categoria/plist-admin-unrouted/categoria-plist-admin-unrouted';
import { UsuarioPlistAdminUnrouted } from '../../usuario/plist-admin-unrouted/usuario-plist-admin-unrouted';

@Component({
  selector: 'app-equipo-edit-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './equipo-edit.html',
  styleUrl: './equipo-edit.css',
})
export class EquipoEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oEquipoService = inject(EquipoService);
  private snackBar = inject(MatSnackBar);
  private oCategoriaService = inject(CategoriaService);
  private oUsuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);

  equipoForm!: FormGroup;
  id_equipo = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  selectedCategoria = signal<ICategoria | null>(null);
  selectedEntrenador = signal<IUsuario | null>(null);

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de equipo no válido');
      this.loading.set(false);
      return;
    }

    this.id_equipo.set(Number(idParam));

    if (isNaN(this.id_equipo())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadEquipo();
  }

  private initForm(): void {
    this.equipoForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      id_categoria: [null],
      id_entrenador: [null],
    });
  }

  private loadEquipo(): void {
    this.oEquipoService.get(this.id_equipo()).subscribe({
      next: (equipo: IEquipo) => {
        const categoriaId = equipo.categoria?.id ?? null;
        const entrenadorId = equipo.entrenador?.id ?? null;

        this.equipoForm.patchValue({
          id: equipo.id,
          nombre: equipo.nombre,
          id_categoria: categoriaId,
          id_entrenador: entrenadorId,
        });

        this.syncCategoria(categoriaId);
        this.syncEntrenador(entrenadorId);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el equipo');
        this.snackBar.open('Error cargando el equipo', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private syncCategoria(idCategoria: number | null): void {
    if (!idCategoria) {
      this.selectedCategoria.set(null);
      return;
    }

    this.oCategoriaService.get(idCategoria).subscribe({
      next: (categoria: ICategoria) => {
        this.selectedCategoria.set(categoria);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedCategoria.set(null);
        console.error('Error al sincronizar categoría:', err);
        this.snackBar.open('Error al cargar la categoría seleccionada', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private syncEntrenador(idEntrenador: number | null): void {
    if (!idEntrenador) {
      this.selectedEntrenador.set(null);
      return;
    }

    this.oUsuarioService.get(idEntrenador).subscribe({
      next: (entrenador: IUsuario) => {
        this.selectedEntrenador.set(entrenador);
      },
      error: (err: HttpErrorResponse) => {
        this.selectedEntrenador.set(null);
        console.error('Error al sincronizar entrenador:', err);
        this.snackBar.open('Error al cargar el entrenador seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openCategoriaFinderModal(): void {
    const dialogRef = this.dialog.open(CategoriaPlistAdminUnrouted, {
      height: '800px',
      width: '1000px',
      maxWidth: '95vw',
      panelClass: 'categoria-dialog',
      data: {
        title: 'Aquí elegir categoría',
        message: 'Plist finder para encontrar la categoría y asignarla al equipo',
      },
    });

    dialogRef.afterClosed().subscribe((categoria: ICategoria | null) => {
      if (categoria) {
        this.equipoForm.patchValue({
          id_categoria: categoria.id,
        });
        this.syncCategoria(categoria.id);
        this.snackBar.open(`Categoría seleccionada: ${categoria.nombre}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  openEntrenadorFinderModal(): void {
    const dialogRef = this.dialog.open(UsuarioPlistAdminUnrouted, {
      height: '800px',
      width: '1300px',
      maxWidth: '95vw',
      panelClass: 'usuario-dialog',
      data: {
        title: 'Aquí elegir entrenador',
        message: 'Plist finder para encontrar el entrenador y asignarlo al equipo',
      },
    });

    dialogRef.afterClosed().subscribe((entrenador: IUsuario | null) => {
      if (entrenador) {
        this.equipoForm.patchValue({
          id_entrenador: entrenador.id,
        });
        this.syncEntrenador(entrenador.id);
        const entrenadorNombre = `${entrenador.nombre} ${entrenador.apellido1 ?? ''}`.trim();
        this.snackBar.open(`Entrenador seleccionado: ${entrenadorNombre}`, 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  get entrenadorNombreSeleccionado(): string {
    const entrenador = this.selectedEntrenador();
    if (!entrenador) {
      return '';
    }
    return `${entrenador.nombre} ${entrenador.apellido1 ?? ''}`.trim();
  }

  get nombre() {
    return this.equipoForm.get('nombre');
  }

  get id_categoria() {
    return this.equipoForm.get('id_categoria');
  }

  get id_entrenador() {
    return this.equipoForm.get('id_entrenador');
  }

  onSubmit(): void {
    if (this.equipoForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const equipoData: any = {
      id: this.id_equipo(),
      nombre: this.equipoForm.value.nombre,
    } as Partial<IEquipo>;

    const selectedCategoriaId = this.equipoForm.value.id_categoria;
    const selectedEntrenadorId = this.equipoForm.value.id_entrenador;

    if (selectedCategoriaId) {
      equipoData.categoria = { id: Number(selectedCategoriaId) };
    }
    if (selectedEntrenadorId) {
      equipoData.entrenador = { id: Number(selectedEntrenadorId) };
    }

    this.oEquipoService.update(equipoData).subscribe({
      next: (id: number) => {
        this.snackBar.open('Equipo actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/equipo']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el equipo');
        this.snackBar.open('Error actualizando el equipo', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }
}
