import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComentarioartDetailAdminUnrouted } from '../detail-admin-unrouted/detail-admin-unrouted';

@Component({
  selector: 'app-comentarioart-view',
  standalone: true,
  imports: [ComentarioartDetailAdminUnrouted],
  templateUrl: './comentarioart-view.html',
  styleUrl: './comentarioart-view.css',
})
export class ComentarioartViewRouted {
  
  id!: number;

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
    });
  }
}
