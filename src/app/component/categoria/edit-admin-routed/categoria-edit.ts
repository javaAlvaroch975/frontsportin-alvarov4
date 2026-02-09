import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../../service/categoria';
import { TemporadaService } from '../../../service/temporada';
import { ICategoria } from '../../../model/categoria';
import { ITemporada } from '../../../model/temporada';
import { IPage } from '../../../model/plist';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-categoria-edit',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './categoria-edit.html',
  styleUrl: './categoria-edit.css',
})
export class CategoriaEditAdminRouted implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oCategoriaService = inject(CategoriaService);
  private oTemporadaService = inject(TemporadaService);
  private snackBar = inject(MatSnackBar);

  categoriaForm!: FormGroup;
  categoriaId: number | null = null;
  loading: boolean = true;
  error: string | null = null;
  submitting: boolean = false;
  temporadas: ITemporada[] = [];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTemporadas();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoriaId = +id;
      this.cargarCategoria(+id);
    } else {
      this.loading = false;
      this.error = 'ID de categoría no válido';
    }
  }

  inicializarFormulario(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(255)
      ]],
      id_temporada: [null, [Validators.required]]
    });
  }

  cargarTemporadas(): void {
    this.oTemporadaService.getPage(0, 100, 'descripcion', 'asc', '', 0).subscribe({
      next: (page: IPage<ITemporada>) => {
        this.temporadas = page.content.map(t => ({
          id: t.id,
          descripcion: t.descripcion
        } as any));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar temporadas', err);
        this.snackBar.open('Error al cargar las temporadas', 'Cerrar', { duration: 4000 });
      }
    });
  }

  cargarCategoria(id: number): void {
    this.oCategoriaService.get(id).subscribe({
      next: (categoria: ICategoria) => {
        this.categoriaForm.patchValue({
          nombre: categoria.nombre,
          id_temporada: categoria.temporada.id
        });
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error al cargar la categoría';
        this.loading = false;
        console.error(err);
      }
    });
  }

  enviarFormulario(): void {
    if (!this.categoriaForm.valid || !this.categoriaId) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload: any = {
      id: this.categoriaId,
      nombre: this.categoriaForm.value.nombre,
      temporada: {
        id: this.categoriaForm.value.id_temporada
      }
    };

    this.oCategoriaService.update(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/categoria']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = 'Error al actualizar la categoría';
        this.snackBar.open('Error al actualizar la categoría', 'Cerrar', { duration: 4000 });
        console.error(err);
      }
    });
  }

  get nombre() {
    return this.categoriaForm.get('nombre');
  }

  get id_temporada() {
    return this.categoriaForm.get('id_temporada');
  }
}
