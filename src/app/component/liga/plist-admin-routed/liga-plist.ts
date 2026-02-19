import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LigaPlistAdminUnrouted } from '../plist-admin-unrouted/liga-plist-admin-unrouted';

@Component({
  selector: 'app-liga-plist',
  imports: [LigaPlistAdminUnrouted],
  templateUrl: './liga-plist.html',
  styleUrls: ['./liga-plist.css'],
  standalone: true,
})
export class LigaPlistAdminRouted {
  equipo = signal<number>(0);

  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id_equipo');
    if (id) {
      this.equipo.set(+id);
    }
  }
}
