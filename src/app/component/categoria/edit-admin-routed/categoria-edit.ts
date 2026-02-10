import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriaService } from '../../../service/categoria';
import { TemporadaService } from '../../../service/temporada';
import { ICategoria } from '../../../model/categoria';
import { ITemporada } from '../../../model/temporada';

@Component({
  selector: 'app-categoria-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-edit.html',
  styleUrl: './categoria-edit.css',
})
export class CategoriaEditAdminRouted implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oCategoriaService = inject(CategoriaService);
  private oTemporadaService = inject(TemporadaService);
  private snackBar = inject(MatSnackBar);

  categoriaForm!: FormGroup;
  id_categoria = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  temporadas = signal<ITemporada[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadTemporadas();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de categoría no válido');
      this.loading.set(false);
      return;
    }

    this.id_categoria.set(Number(idParam));

    if (isNaN(this.id_categoria())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadCategoria();
  }

  private initForm(): void {
    this.categoriaForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      nombre: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
      id_temporada: [null, Validators.required]
    });
  }

  private loadCategoria(): void {
    this.oCategoriaService.get(this.id_categoria()).subscribe({
      next: (categoria: ICategoria) => {
        this.categoriaForm.patchValue({
          id: categoria.id,
          nombre: categoria.nombre,
          id_temporada: categoria.temporada?.id
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la categoría');
        this.snackBar.open('Error cargando la categoría', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  private loadTemporadas(): void {
    this.oTemporadaService.getPage(0, 1000, 'descripcion', 'asc', '', 0).subscribe({
      next: (page) => {
        this.temporadas.set(page.content);
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando temporadas', 'Cerrar', { duration: 4000 });
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

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);

    const categoriaData: any = {
      id: this.id_categoria(),
      nombre: this.categoriaForm.value.nombre,
      temporada: { id: this.categoriaForm.value.id_temporada }
    };

    this.oCategoriaService.update(categoriaData).subscribe({
      next: () => {
        this.snackBar.open('Categoría actualizada exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/categoria']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando la categoría');
        this.snackBar.open('Error actualizando la categoría', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      }
    });
  }
}
