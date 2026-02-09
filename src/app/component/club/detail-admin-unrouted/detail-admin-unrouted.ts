import { Component, inject, input, Input, OnInit, Signal, signal } from '@angular/core';
import { IClub } from '../../../model/club';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ClubService } from '../../../service/club';
import { DatetimePipe } from '../../../pipe/datetime-pipe';

@Component({
  selector: 'app-detail-admin-unrouted',
  imports: [DatetimePipe, RouterLink],
  templateUrl: './detail-admin-unrouted.html',
  styleUrl: './detail-admin-unrouted.css',
})
export class DetailAdminUnrouted implements OnInit {
  @Input() id: Signal<number> = signal(0);

  private oClubService = inject(ClubService);
  //private snackBar = inject(MatSnackBar);

  oClub = signal<IClub | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {  
    this.load(this.id());
  }

  load(id: number) {
    this.oClubService.get(id).subscribe({
      next: (data: IClub) => {
        this.oClub.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el club');
        this.loading.set(false);
        //this.snackBar.open('Error cargando el club', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }
}
