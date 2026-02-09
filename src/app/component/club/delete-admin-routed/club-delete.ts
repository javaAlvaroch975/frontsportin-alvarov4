import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClubService } from '../../../service/club';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IClub } from '../../../model/club';
import { HttpErrorResponse } from '@angular/common/http';
import { DetailAdminUnrouted } from "../detail-admin-unrouted/detail-admin-unrouted";

@Component({
  selector: 'app-club-delete',
  imports: [DetailAdminUnrouted],
  templateUrl: './club-delete.html',
  styleUrl: './club-delete.css',
})
export class ClubDeleteAdminRouted {
  
  private route = inject(ActivatedRoute);
  private oClubService = inject(ClubService);
  private snackBar = inject(MatSnackBar);

  oClub = signal<IClub | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_club = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_club.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_club())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }    
  }

  doDelete() {
    this.oClubService.delete(this.id_club()).subscribe({
      next: (data: any) => {
        this.snackBar.open('Club eliminado', 'Cerrar', { duration: 4000 });
        console.log('Club eliminado');
        window.history.back();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error eliminando el club');
        this.snackBar.open('Error eliminando el club', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  doCancel() {    
    window.history.back();
  }
}
