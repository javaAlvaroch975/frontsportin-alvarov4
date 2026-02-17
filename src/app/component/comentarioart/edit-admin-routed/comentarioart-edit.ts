import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IArticulo } from '../../../model/articulo';
import { IComentarioart } from '../../../model/comentarioart';
import { IUsuario } from '../../../model/usuario';
import { ArticuloService } from '../../../service/articulo';
import { ComentarioartService } from '../../../service/comentarioart';
import { UsuarioService } from '../../../service/usuarioService';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';

@Component({
  selector: 'app-comentarioart-edit-admin-routed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Paginacion, BotoneraRpp],
  templateUrl: './comentarioart-edit.html',
  styleUrl: './comentarioart-edit.css',
})
export class ComentarioartEditAdminRouted implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private oComentarioartService = inject(ComentarioartService);
  private oArticuloService = inject(ArticuloService);
  private oUsuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  comentarioartForm!: FormGroup;
  id_comentarioart = signal<number>(0);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  articulos = signal<IArticulo[]>([]);
  usuarios = signal<IUsuario[]>([]);
  selectedArticulo = signal<IArticulo | null>(null);
  displayIdArticulo = signal<number | null>(null);
  selectedUsuario = signal<IUsuario | null>(null);
  displayIdUsuario = signal<number | null>(null);
  articuloSearch = signal<string>('');
  articuloSortDirection = signal<'asc' | 'desc'>('asc');
  articuloPage = signal<number>(0);
  articuloRpp = signal<number>(10);
  filteredArticulos = computed(() => {
    const term = this.articuloSearch().toLowerCase().trim();
    const items = this.articulos();
    if (!term) {
      return items;
    }
    return items.filter((articulo) => {
      const descripcion = (articulo.descripcion || '').toLowerCase();
      const idMatch = String(articulo.id).includes(term);
      return descripcion.includes(term) || idMatch;
    });
  });
  sortedArticulos = computed(() => {
    const direction = this.articuloSortDirection();
    return [...this.filteredArticulos()].sort((a, b) => {
      if (direction === 'asc') {
        return a.id - b.id;
      }
      return b.id - a.id;
    });
  });
  articuloTotalPages = computed(() => {
    const total = this.filteredArticulos().length;
    const rpp = this.articuloRpp();
    return Math.max(1, Math.ceil(total / rpp));
  });
  pagedArticulos = computed(() => {
    const page = this.articuloPage();
    const rpp = this.articuloRpp();
    const start = page * rpp;
    return this.sortedArticulos().slice(start, start + rpp);
  });
  usuarioSearch = signal<string>('');
  usuarioSortDirection = signal<'asc' | 'desc'>('asc');
  usuarioPage = signal<number>(0);
  usuarioRpp = signal<number>(10);
  filteredUsuarios = computed(() => {
    const term = this.usuarioSearch().toLowerCase().trim();
    const items = this.usuarios();
    if (!term) {
      return items;
    }
    return items.filter((usuario) => {
      const nombre = `${usuario.nombre ?? ''} ${usuario.apellido1 ?? ''} ${usuario.apellido2 ?? ''}`
        .toLowerCase()
        .trim();
      const username = (usuario.username || '').toLowerCase();
      const idMatch = String(usuario.id).includes(term);
      return nombre.includes(term) || username.includes(term) || idMatch;
    });
  });
  sortedUsuarios = computed(() => {
    const direction = this.usuarioSortDirection();
    return [...this.filteredUsuarios()].sort((a, b) => {
      if (direction === 'asc') {
        return a.id - b.id;
      }
      return b.id - a.id;
    });
  });
  usuarioTotalPages = computed(() => {
    const total = this.filteredUsuarios().length;
    const rpp = this.usuarioRpp();
    return Math.max(1, Math.ceil(total / rpp));
  });
  pagedUsuarios = computed(() => {
    const page = this.usuarioPage();
    const rpp = this.usuarioRpp();
    const start = page * rpp;
    return this.sortedUsuarios().slice(start, start + rpp);
  });

  @ViewChild('articuloDialog') articuloDialog?: TemplateRef<any>;
  @ViewChild('usuarioDialog') usuarioDialog?: TemplateRef<any>;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.initForm();
    this.loadArticulos();
    this.loadUsuarios();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam || idParam === '0') {
      this.error.set('ID de comentario no valido');
      this.loading.set(false);
      return;
    }

    this.id_comentarioart.set(Number(idParam));

    if (isNaN(this.id_comentarioart())) {
      this.error.set('ID no valido');
      this.loading.set(false);
      return;
    }

    this.loadComentarioart();
  }

  private initForm(): void {
    this.comentarioartForm = this.fb.group({
      id: [{ value: 0, disabled: true }],
      contenido: ['', [Validators.required]],
      id_articulo: [null, Validators.required],
      id_usuario: [null, Validators.required],
    });

    this.comentarioartForm.get('id_usuario')?.valueChanges.subscribe((id) => {
      if (id) {
        this.syncUsuario(Number(id));
      } else {
        this.selectedUsuario.set(null);
        this.displayIdUsuario.set(null);
      }
    });

    this.comentarioartForm.get('id_articulo')?.valueChanges.subscribe((id) => {
      if (id) {
        this.syncArticulo(Number(id));
      } else {
        this.selectedArticulo.set(null);
        this.displayIdArticulo.set(null);
      }
    });
  }

  private loadComentarioart(): void {
    this.oComentarioartService.get(this.id_comentarioart()).subscribe({
      next: (comentarioart: IComentarioart) => {
        const idArticulo = comentarioart.articulo?.id ?? comentarioart.idArticulo ?? null;
        const idUsuario = comentarioart.usuario?.id ?? comentarioart.idUsuario ?? null;
        this.comentarioartForm.patchValue({
          id: comentarioart.id,
          contenido: comentarioart.contenido,
          id_articulo: idArticulo,
          id_usuario: idUsuario,
        });
        if (idArticulo) {
          this.syncArticulo(idArticulo);
        }
        if (idUsuario) {
          this.syncUsuario(idUsuario);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el comentario');
        this.snackBar.open('Error cargando el comentario', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private loadArticulos(): void {
    this.oArticuloService.getPage(0, 1000, 'descripcion', 'asc').subscribe({
      next: (page) => {
        this.articulos.set(page.content);
        const idActual = this.comentarioartForm.get('id_articulo')?.value;
        if (idActual) {
          this.syncArticulo(Number(idActual));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando articulos', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  private loadUsuarios(): void {
    this.oUsuarioService.getPage(0, 1000, 'nombre', 'asc').subscribe({
      next: (page) => {
        this.usuarios.set(page.content);
        const idActual = this.comentarioartForm.get('id_usuario')?.value;
        if (idActual) {
          this.syncUsuario(Number(idActual));
        }
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.open('Error cargando usuarios', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  get contenido() {
    return this.comentarioartForm.get('contenido');
  }

  get id_articulo() {
    return this.comentarioartForm.get('id_articulo');
  }

  get id_usuario() {
    return this.comentarioartForm.get('id_usuario');
  }

  private syncUsuario(idUsuario: number): void {
    this.displayIdUsuario.set(idUsuario);
    const usuario = this.usuarios().find((item) => item.id === idUsuario) ?? null;
    this.selectedUsuario.set(usuario);
  }

  private syncArticulo(idArticulo: number): void {
    this.displayIdArticulo.set(idArticulo);
    const articulo = this.articulos().find((item) => item.id === idArticulo) ?? null;
    this.selectedArticulo.set(articulo);
  }

  onSubmit(): void {
    if (this.comentarioartForm.invalid) {
      this.snackBar.open('Por favor, complete todos los campos correctamente', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    this.submitting.set(true);

    const idArticulo = Number(this.comentarioartForm.value.id_articulo);
    const idUsuario = Number(this.comentarioartForm.value.id_usuario);

    const comentarioartData: any = {
      id: this.id_comentarioart(),
      contenido: this.comentarioartForm.value.contenido,
      idArticulo,
      idUsuario,
      articulo: { id: idArticulo },
      usuario: { id: idUsuario },
    };

    this.oComentarioartService.update(comentarioartData).subscribe({
      next: () => {
        this.snackBar.open('Comentario actualizado exitosamente', 'Cerrar', { duration: 4000 });
        this.submitting.set(false);
        this.router.navigate(['/comentarioart']);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error actualizando el comentario');
        this.snackBar.open('Error actualizando el comentario', 'Cerrar', { duration: 4000 });
        console.error(err);
        this.submitting.set(false);
      },
    });
  }

  openUsuarioFinderModal(): void {
    if (!this.usuarioDialog) {
      return;
    }

    this.dialog.open(this.usuarioDialog, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'usuario-dialog',
    });
  }

  openArticuloFinderModal(): void {
    if (!this.articuloDialog) {
      return;
    }

    this.dialog.open(this.articuloDialog, {
      height: '800px',
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'articulo-dialog',
    });
  }

  onArticuloSearch(value: string): void {
    this.articuloSearch.set(value);
    this.articuloPage.set(0);
  }

  toggleArticuloSort(): void {
    this.articuloSortDirection.set(this.articuloSortDirection() === 'asc' ? 'desc' : 'asc');
  }

  onArticuloPageChange(page: number): void {
    this.articuloPage.set(page);
  }

  onArticuloRppChange(rpp: number): void {
    this.articuloRpp.set(rpp);
    this.articuloPage.set(0);
  }

  selectArticulo(articulo: IArticulo, dialogRef: any): void {
    this.comentarioartForm.patchValue({
      id_articulo: articulo.id,
    });
    this.syncArticulo(articulo.id);
    dialogRef?.close();
    this.snackBar.open(`Articulo seleccionado: ${articulo.descripcion}`, 'Cerrar', {
      duration: 3000,
    });
  }

  onUsuarioSearch(value: string): void {
    this.usuarioSearch.set(value);
    this.usuarioPage.set(0);
  }

  toggleUsuarioSort(): void {
    this.usuarioSortDirection.set(this.usuarioSortDirection() === 'asc' ? 'desc' : 'asc');
  }

  onUsuarioPageChange(page: number): void {
    this.usuarioPage.set(page);
  }

  onUsuarioRppChange(rpp: number): void {
    this.usuarioRpp.set(rpp);
    this.usuarioPage.set(0);
  }

  selectUsuario(usuario: IUsuario, dialogRef: any): void {
    this.comentarioartForm.patchValue({
      id_usuario: usuario.id,
    });
    this.syncUsuario(usuario.id);
    dialogRef?.close();
    this.snackBar.open(
      `Usuario seleccionado: ${usuario.nombre} ${usuario.apellido1 ?? ''} ${
        usuario.apellido2 ?? ''
      }`,
      'Cerrar',
      {
        duration: 3000,
      },
    );
  }
}
