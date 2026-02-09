import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolusuarioService } from '../../../service/rolusuario';
import { IRolusuario } from '../../../model/rolusuario';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
// import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-rolusuario-edit',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './rolusuario-edit.html',
  styleUrl: './rolusuario-edit.css',
})
export class RolusuarioEditAdminRouted implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oRolusuarioService = inject(RolusuarioService);
  // private snackBar = inject(MatSnackBar);

  rolusuarioForm!: FormGroup;
  rolusuarioId: number | null = null;
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  submitting = signal<boolean>(false);

  ngOnInit(): void {
    this.inicializarFormulario();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rolusuarioId = +id;
      this.cargarRolusuario(+id);
    } else {
      this.loading.set(false);
      this.error.set('ID de rol de usuario no válido');
    }
  }

  inicializarFormulario(): void {
    this.rolusuarioForm = this.fb.group({
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]]
    });
  }

  cargarRolusuario(id: number): void {
    this.oRolusuarioService.get(id).subscribe({
      next: (rolusuario: IRolusuario) => {
        this.rolusuarioForm.patchValue({
          descripcion: rolusuario.descripcion
        });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error al cargar el rol de usuario');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  enviarFormulario(): void {
    if (!this.rolusuarioForm.valid || !this.rolusuarioId) {
      this.rolusuarioForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const payload: any = {
      id: this.rolusuarioId,
      descripcion: this.rolusuarioForm.value.descripcion
    };

    this.oRolusuarioService.update(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        // this.snackBar.open('Rol de usuario actualizado correctamente', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/rolusuario']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set('Error al actualizar el rol de usuario');
        // this.snackBar.open('Error al actualizar el rol de usuario', 'Cerrar', { duration: 4000 });
        console.error(err);
      }
    });
  }

  get descripcion() {
    return this.rolusuarioForm.get('descripcion');
  }
}
