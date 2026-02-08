import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TemporadaService } from '../../../service/temporada';
import { ITemporada } from '../../../model/temporada';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { IClub } from '../../../model/club';

@Component({
    selector: 'app-temporada-edit',
    imports: [ReactiveFormsModule],
    templateUrl: './temporada-edit.html',
    styleUrl: './temporada-edit.css',
})
export class TemporadaEditAdminRouted implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private temporadaService = inject(TemporadaService);
    private snackBar = inject(MatSnackBar);
    private location = inject(Location);

    temporadaForm!: FormGroup;
    // estado convertido a signals
    temporadaId = signal<number | null>(null);
    loading = signal<boolean>(true);
    error = signal<string | null>(null);
    submitting = signal<boolean>(false);

    ngOnInit(): void {
        this.initForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.temporadaId.set(+id);
            this.getTemporada(+id);
        } else {
            this.error.set('ID de temporada no válido');
            this.loading.set(false);
        }
    }

    initForm(): void {
        this.temporadaForm = this.fb.group({
            descripcion: ['', [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(100)
            ]],
            id_club: [null, [
                Validators.required,
                Validators.min(1)
            ]],
        });
    }

    getTemporada(id: number): void {
        this.temporadaService.get(id).subscribe({
            next: (temporada: ITemporada) => {
                this.temporadaForm.patchValue({
                    descripcion: temporada.descripcion,
                    id_club: temporada.club.id,
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
        if (!this.temporadaForm.valid || !this.temporadaId()) {
            this.temporadaForm.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const payload = {
            id: this.temporadaId()!,
            descripcion: this.temporadaForm.value.descripcion,
            club: {
                id: Number(this.temporadaForm.value.id_club),
            },
        } as unknown as Partial<ITemporada> & { club?: Partial<IClub> };

        this.temporadaService.update(payload).subscribe({
            next: () => {
                this.submitting.set(false);
                // mark form as pristine so canDeactivate guard won't ask confirmation
                if (this.temporadaForm) {
                    this.temporadaForm.markAsPristine();
                }
                // inform the user
                this.snackBar.open('Se ha guardado correctamente', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/temporada']);
            },
            error: (err: HttpErrorResponse) => {
                this.submitting.set(false);
                this.error.set('Error al guardar el registro');
                this.snackBar.open('Error al guardar el registro', 'Cerrar', { duration: 4000 });
                console.error(err);
            },
        });
    }

    goBack(): void {
        this.location.back();
    }


    get descripcion() {
        return this.temporadaForm.get('descripcion');
    }

    get id_club() {
        return this.temporadaForm.get('id_club');
    }

}
