import { Component, signal, OnInit, inject, Input, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PartidoService } from '../../../service/partido';
import { IPartido } from '../../../model/partido';


@Component({
  selector: 'app-partido-detail-unrouted',
  imports: [CommonModule, RouterLink],
  templateUrl: './partido-detail.html',
  styleUrl: './partido-detail.css',
})
export class PartidoDetailAdminUnrouted implements OnInit {

  @Input() id: Signal<number> = signal(0);
  private oPartidoService = inject(PartidoService);

  oPartido = signal<IPartido | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(this.id());
  }

  load(id: number) {
    this.oPartidoService.get(id).subscribe({
      next: (data: IPartido) => {
        this.oPartido.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set('Error cargando el partido');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
