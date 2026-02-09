import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ICompra } from '../../../model/compra';
import { DetailAdminUnrouted } from "../detail-admin-unrouted/compra-detail";

@Component({
  selector: 'app-compra-view',
  imports: [CommonModule, DetailAdminUnrouted],
  templateUrl: './compra-view.html',
  styleUrl: './compra-view.css',
})
export class CompraViewRouted implements OnInit {
  private route = inject(ActivatedRoute);

  oCompra = signal<ICompra | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  id_compra = signal<number>(0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id_compra.set(idParam ? Number(idParam) : NaN);
    if (isNaN(this.id_compra())) {
      this.error.set('ID no válido');
      this.loading.set(false);
      return;
    }
  }
}
