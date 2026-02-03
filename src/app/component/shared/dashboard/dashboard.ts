import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClubService } from '../../../service/club';
import { NoticiaService } from '../../../service/noticia';
import { ComentarioService } from '../../../service/comentario';
import { PuntuacionService } from '../../../service/puntuacion';
import { TemporadaService } from '../../../service/temporada';
import { CategoriaService } from '../../../service/categoria';
import { EquipoService } from '../../../service/equipo';
import { LigaService } from '../../../service/liga';
import { PartidoService } from '../../../service/partido';
import { JugadorService } from '../../../service/jugador-service';
import { CuotaService } from '../../../service/cuota';
import { PagoService } from '../../../service/pago';
import { ArticuloService } from '../../../service/articulo';
import { TipoarticuloService } from '../../../service/tipoarticulo';
import { CompraService } from '../../../service/compra';
import { FacturaService } from '../../../service/factura-service';
import { CarritoService } from '../../../service/carrito';
import { ComentarioartService } from '../../../service/comentarioart';
import { UsuarioService } from '../../../service/usuarioService';
import { TipousuarioService } from '../../../service/tipousuario';
import { RolusuarioService } from '../../../service/rolusuario';
import { forkJoin } from 'rxjs';

interface DashboardCard {
  title: string;
  icon: string;
  count: number;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  
  loading = signal(true);
  
  constructor(
    private cdr: ChangeDetectorRef,
    private clubService: ClubService,
    private noticiaService: NoticiaService,
    private comentarioService: ComentarioService,
    private puntuacionService: PuntuacionService,
    private temporadaService: TemporadaService,
    private categoriaService: CategoriaService,
    private equipoService: EquipoService,
    private ligaService: LigaService,
    private partidoService: PartidoService,
    private jugadorService: JugadorService,
    private cuotaService: CuotaService,
    private pagoService: PagoService,
    private articuloService: ArticuloService,
    private tipoarticuloService: TipoarticuloService,
    private compraService: CompraService,
    private facturaService: FacturaService,
    private carritoService: CarritoService,
    private comentarioartService: ComentarioartService,
    private usuarioService: UsuarioService,
    private tipousuarioService: TipousuarioService,
    private rolusuarioService: RolusuarioService
  ) {}
  cards: DashboardCard[] = [
    {
      title: 'Clubes',
      icon: 'building',
      count: 0,
      color: 'primary',
      route: '/club'
    },
    {
      title: 'Noticias',
      icon: 'newspaper',
      count: 0,
      color: 'warning',
      route: '/noticia'
    },
    {
      title: 'Comentarios',
      icon: 'chat-left-text',
      count: 0,
      color: 'info',
      route: '/comentario'
    },
    {
      title: 'Puntuaciones',
      icon: 'star-fill',
      count: 0,
      color: 'secondary',
      route: '/puntuacion'
    },
    {
      title: 'Temporadas',
      icon: 'calendar',
      count: 0,
      color: 'danger',
      route: '/temporada'
    },
    {
      title: 'Categorías',
      icon: 'tags',
      count: 0,
      color: 'success',
      route: '/categoria'
    },
    {
      title: 'Equipos',
      icon: 'people-fill',
      count: 0,
      color: 'primary',
      route: '/equipo'
    },
    {
      title: 'Ligas',
      icon: 'trophy',
      count: 0,
      color: 'warning',
      route: '/liga'
    },
    {
      title: 'Partidos',
      icon: 'play-fill',
      count: 0,
      color: 'info',
      route: '/partido'
    },
    {
      title: 'Jugadores',
      icon: 'person-fill',
      count: 0,
      color: 'secondary',
      route: '/jugador'
    },
    {
      title: 'Cuotas',
      icon: 'credit-card',
      count: 0,
      color: 'danger',
      route: '/cuota'
    },
    {
      title: 'Pagos',
      icon: 'cash-coin',
      count: 0,
      color: 'success',
      route: '/pago'
    },
    {
      title: 'Artículos',
      icon: 'bag-fill',
      count: 0,
      color: 'primary',
      route: '/articulo'
    },
    {
      title: 'Tipos de Artículo',
      icon: 'bookmark-fill',
      count: 0,
      color: 'warning',
      route: '/tipoarticulo'
    },
    {
      title: 'Compras',
      icon: 'cart-fill',
      count: 0,
      color: 'info',
      route: '/compra'
    },
    {
      title: 'Facturas',
      icon: 'receipt',
      count: 0,
      color: 'secondary',
      route: '/factura'
    },
    {
      title: 'Carritos',
      icon: 'bag-check',
      count: 0,
      color: 'danger',
      route: '/carrito'
    },
    {
      title: 'Comentarios Artículos',
      icon: 'chat-dots',
      count: 0,
      color: 'success',
      route: '/comentarioart'
    },
    {
      title: 'Usuarios',
      icon: 'people',
      count: 0,
      color: 'primary',
      route: '/usuario'
    },
    {
      title: 'Tipos de Usuario',
      icon: 'tags-fill',
      count: 0,
      color: 'warning',
      route: '/tipousuario'
    },
    {
      title: 'Roles',
      icon: 'shield-check',
      count: 0,
      color: 'info',
      route: '/rolusuario'
    }
  ];

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    forkJoin({
      clubes: this.clubService.count(),
      noticias: this.noticiaService.count(),
      comentarios: this.comentarioService.count(),
      puntuaciones: this.puntuacionService.count(),
      temporadas: this.temporadaService.count(),
      categorias: this.categoriaService.count(),
      equipos: this.equipoService.count(),
      ligas: this.ligaService.count(),
      partidos: this.partidoService.count(),
      jugadores: this.jugadorService.count(),
      cuotas: this.cuotaService.count(),
      pagos: this.pagoService.count(),
      articulos: this.articuloService.count(),
      tiposArticulo: this.tipoarticuloService.count(),
      compras: this.compraService.count(),
      facturas: this.facturaService.count(),
      carritos: this.carritoService.count(),
      comentariosArt: this.comentarioartService.count(),
      usuarios: this.usuarioService.count(),
      tiposUsuario: this.tipousuarioService.count(),
      roles: this.rolusuarioService.count()
    }).subscribe({
      next: (counts) => {
        this.cards = [
          { ...this.cards[0], count: counts.clubes },
          { ...this.cards[1], count: counts.noticias },
          { ...this.cards[2], count: counts.comentarios },
          { ...this.cards[3], count: counts.puntuaciones },
          { ...this.cards[4], count: counts.temporadas },
          { ...this.cards[5], count: counts.categorias },
          { ...this.cards[6], count: counts.equipos },
          { ...this.cards[7], count: counts.ligas },
          { ...this.cards[8], count: counts.partidos },
          { ...this.cards[9], count: counts.jugadores },
          { ...this.cards[10], count: counts.cuotas },
          { ...this.cards[11], count: counts.pagos },
          { ...this.cards[12], count: counts.articulos },
          { ...this.cards[13], count: counts.tiposArticulo },
          { ...this.cards[14], count: counts.compras },
          { ...this.cards[15], count: counts.facturas },
          { ...this.cards[16], count: counts.carritos },
          { ...this.cards[17], count: counts.comentariosArt },
          { ...this.cards[18], count: counts.usuarios },
          { ...this.cards[19], count: counts.tiposUsuario },
          { ...this.cards[20], count: counts.roles }
        ];
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading counts:', error);
        this.loading.set(false);
      }
    });
  }
}
