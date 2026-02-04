import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { INoticia } from '../../../model/noticia';
import { NoticiaService } from '../../../service/noticia';

@Component({
  selector: 'app-view-admin-routed',
  imports: [CommonModule],
  templateUrl: './view-admin-routed.html',
  styleUrl: './view-admin-routed.css',
})
export class ViewAdminRouted implements OnInit {

  oNoticiaModel: INoticia | null = null;

  constructor(private route: ActivatedRoute, private noticiaService: NoticiaService) {
    
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.noticiaService.getById(id).subscribe({
        next: noticia => this.oNoticiaModel = noticia,
        error: err => console.error('Error cargando noticia', err),
      });
    }
  }
}
