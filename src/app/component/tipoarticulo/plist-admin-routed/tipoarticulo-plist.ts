import { Component, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IPage } from '../../../model/plist';
import { ITipoarticulo } from '../../../model/tipoarticulo';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { TrimPipe } from '../../../pipe/trim-pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTimeSearch } from '../../../environment/environment';
import { TipoarticuloPlistAdminUnrouted } from '../plist-admin-unrouted/tipoarticulo-plist-admin-unrouted';

@Component({
  selector: 'app-tipoarticulo-plist',
  imports: [TipoarticuloPlistAdminUnrouted],
  templateUrl: './tipoarticulo-plist.html',
  styleUrl: './tipoarticulo-plist.css',
})
export class TipoarticuloPlistAdminRouted {
  club = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id_club');
    if (id) {
      this.club.set(+id);
    }
  }
}
