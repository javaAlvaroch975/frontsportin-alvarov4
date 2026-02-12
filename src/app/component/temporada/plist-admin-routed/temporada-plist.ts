import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TemporadaPlistAdminUnrouted } from '../plist-admin-unrouted/temporada-plist-admin-unrouted';

@Component({
  selector: 'app-temporada-plist',
  imports: [TemporadaPlistAdminUnrouted],
  templateUrl: './temporada-plist.html',
  styleUrl: './temporada-plist.css',
})
export class TemporadaPlist {
  club = signal<number>(0);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id_club');
    if (id) {
      this.club.set(+id);
    }
  }
}
