import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { JugadorService } from '../../../service/jugador-service';
import { UsuarioService } from '../../../service/usuarioService';
import { EquipoService } from '../../../service/equipo';
import { IUsuario } from '../../../model/usuario';
import { IJugador } from '../../../model/jugador';
import { IEquipo } from '../../../model/equipo';
import { UsuarioPlistAdminUnrouted } from '../../usuario/plist-admin-unrouted/usuario-plist-admin-unrouted';
import { EquipoPlistAdminUnrouted } from '../../equipo/plist-admin-unrouted/equipo-plist-admin-unrouted';

@Component({
  selector: 'app-jugador-edit-routed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jugador-edit.html',
  styleUrl: './jugador-edit.css',
})
export class JugadorEditAdminRouted implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oJugadorService = inject(JugadorService);
  private oUsuarioService = inject(UsuarioService);
  private oEquipoService = inject(EquipoService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  jugadorForm!: FormGroup;
  id_jugador = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  jugadorActual = signal<IJugador | null>(null);
  selectedUsuario = signal<IUsuario | null>(null);
  selectedEquipo = signal<IEquipo | null>(null);

  ngOnInit(): void {
  this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
  this.error.set('ID de jugador no válido');
      this.loading.set(false);
      return;
    }

    this.id_jugador.set(Number(idParam));

    if (isNaN(this.id_jugador())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }

    this.loadJugador();
  }

  private initForm(): void {
    this.jugadorForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      posicion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      dorsal: [0, [Validators.required, Validators.min(0)]],
      capitan: [false],
      id_usuario: [null, Validators.required],
      id_equipo: [null, Validators.required]
    });
  }

  private loadJugador(): void {
    this.oJugadorService.getById(this.id_jugador()).subscribe({
      next: (jugador: IJugador) => {
        this.jugadorActual.set(jugador);
        this.jugadorForm.patchValue({
          id: jugador.id,
          posicion: jugador.posicion,
          dorsal: jugador.dorsal,
          capitan: !!jugador.capitan,
          id_usuario: jugador.usuario?.id || null,
          id_equipo: jugador.equipo?.id || null
        });

        // Sincronizar detalles de relaciones (para mostrar en el edit)
        const idUsuario = jugador.usuario?.id;
        const idEquipo = jugador.equipo?.id;
        if (typeof idUsuario === 'number' && idUsuario > 0) {
          this.syncUsuario(idUsuario);
        }
        if (typeof idEquipo === 'number' && idEquipo > 0) {
          this.syncEquipo(idEquipo);
        }

  this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
  this.error.set('Error cargando el jugador');
  this.snackBar.open('Error cargando el jugador', 'Cerrar', { duration: 4000 });
  this.loading.set(false);
        console.error(err);
      }
    });
  }

  private syncUsuario(idUsuario: number): void {
    this.oUsuarioService.get(idUsuario).subscribe({
      next: (usuario: IUsuario) => {
        this.selectedUsuario.set(usuario);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar usuario:', err);
        this.snackBar.open('Error al cargar el usuario seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private syncEquipo(idEquipo: number): void {
    this.oEquipoService.get(idEquipo).subscribe({
      next: (equipo: IEquipo) => {
        this.selectedEquipo.set(equipo);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al sincronizar equipo:', err);
        this.snackBar.open('Error al cargar el equipo seleccionado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openUsuarioFinderModal(): void {
    const dialogRef = this.dialog.open(UsuarioPlistAdminUnrouted, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'usuario-dialog',
      data: {
        title: 'Aquí elegir usuario',
        message: 'Plist finder para encontrar el usuario y asignarlo al jugador',
      },
    });

    dialogRef.afterClosed().subscribe((usuario: IUsuario | null) => {
      if (usuario) {
        this.jugadorForm.patchValue({
          id_usuario: usuario.id,
        });
        this.syncUsuario(usuario.id);
        this.snackBar.open(`Usuario seleccionado: ${usuario.username}`, 'Cerrar', { duration: 3000 });
      }
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
        message: 'Plist finder para encontrar el equipo y asignarlo al jugador',
      },
    });

    dialogRef.afterClosed().subscribe((equipo: IEquipo | null) => {
      if (equipo) {
        this.jugadorForm.patchValue({
          id_equipo: equipo.id,
        });
        if (typeof equipo.id === 'number') {
          this.syncEquipo(equipo.id);
        }
        this.snackBar.open(`Equipo seleccionado: ${equipo.nombre}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  get posicion() {
      return this.jugadorForm.get('posicion');
    }

  get dorsal() {
      return this.jugadorForm.get('dorsal');
    }

  get capitan() {
      return this.jugadorForm.get('capitan');
    }

  get id_usuario() {
    return this.jugadorForm.get('id_usuario');
  }

  get id_equipo() {
    return this.jugadorForm.get('id_equipo');
  }

  enviarFormulario(): void {
    // Patrón tipoarticulo: si el form es inválido, marcar y avisar.
    if (this.jugadorForm.invalid) {
      this.jugadorForm.markAllAsTouched();
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', { duration: 4000 });
      return;
    }

    this.submitting.set(true);

    const jugadorActualData = this.jugadorActual();
    
    if (!jugadorActualData) {
  this.submitting.set(false);
      this.snackBar.open('No se pudo cargar los datos del jugador', 'Cerrar', { duration: 4000 });
      return;
    }

    const payload: any = {
      id: this.id_jugador(),
      posicion: this.jugadorForm.value.posicion,
      dorsal: this.jugadorForm.value.dorsal,
      capitan: !!this.jugadorForm.value.capitan,
      usuario: { 
        id: this.jugadorForm.value.id_usuario 
      },
      equipo: {
        id: this.jugadorForm.value.id_equipo
      }
    };

    console.log('Payload a enviar:', payload);

    this.oJugadorService.update(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Jugador actualizado correctamente', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/jugador']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.error.set('Error actualizando el jugador');
        this.snackBar.open('Error al actualizar el jugador', 'Cerrar', { duration: 4000 });
        console.error(err);
      }
    });
  }

  doCancel(): void {
    this.router.navigate(['/jugador']);
  }
}


