import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { TemporadaService } from '../../../service/temporada';
import { ITemporada } from '../../../model/temporada';

@Component({
  selector: 'app-temporada-detail-unrouted',
  imports: [CommonModule, RouterLink, DatetimePipe],
  templateUrl: './temporada-detail.html',
  styleUrl: './temporada-detail.css',
})

export class TemporadaDetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);
  
  private oTemporadaService = inject(TemporadaService);

  oTemporada = signal<ITemporada | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {  
    this.load(this.id());
  }

  load(id: number) {
    this.oTemporadaService.get(id).subscribe({
      next: (data: ITemporada) => {
        this.oTemporada.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando la temporada');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
