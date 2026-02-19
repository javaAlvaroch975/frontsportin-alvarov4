import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IFactura } from '../../../model/factura';
import { FacturaService } from '../../../service/factura-service';
import { IPage } from '../../../model/plist';
import { BotoneraActionsPlist } from "../../shared/botonera-actions-plist/botonera-actions-plist";
import { TrimPipe } from "../../../pipe/trim-pipe";
import { DatetimePipe } from "../../../pipe/datetime-pipe";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { Paginacion } from "../../shared/paginacion/paginacion";
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-plist-admin-unrouted',
  imports: [RouterLink, BotoneraActionsPlist, TrimPipe, DatetimePipe, BotoneraRpp, Paginacion],
  templateUrl: './factura-plist.html',
  styleUrl: './factura-plist.css',
})
export class FacturaPlistAdminUnrouted {
  oPage = signal<IPage<IFactura> | null>(null);
  numPage = signal<number>(0);
  numRpp = signal<number>(5);
  totalElementsCount = signal<number>(0);


  orderField = signal<string>('id');
  orderDirection = signal<string>('asc');

  usuario = signal<number>(0);


  private dialogRef = inject(MatDialogRef<FacturaPlistAdminUnrouted>, { optional: true });

  constructor(
    private oFacturaService: FacturaService, private cdr: ChangeDetectorRef, private route: ActivatedRoute
  ) {}


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id_usuario');
    if (id) {
      this.usuario.set(+id);
    }
    this.getPage();
  }


  getPage() {
    this.oFacturaService
      .getPage(this.numPage(), this.numRpp(), this.orderField(), this.orderDirection(), this.usuario())
      .subscribe({
        next: (data: IPage<IFactura>) => {
          this.oPage.set(data);
          this.totalElementsCount.set(data.totalElements ?? 0);
          if (this.numPage() > 0 && this.numPage() >= data.totalPages) {
            this.numPage.set(data.totalPages - 1);
            this.getPage();
          }
          // Trigger view update under zoneless change detection
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }


  onOrder(order: string) {
    if (this.orderField() === order) {
      this.orderDirection.set(this.orderDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.orderField.set(order);
      this.orderDirection.set('asc');
    }
    this.numPage.set(0);
    this.getPage();
    return false;
  }


  goToPage(numPage: number) {
    this.numPage.set(numPage);
    this.getPage();
  this.cdr.detectChanges();
    return false;
  }


  onRppChange(n: number) {
    this.numRpp.set(n);
    this.getPage();
  this.cdr.detectChanges();
    return false;
  }

  isDialogMode(): boolean {
    return !!this.dialogRef;
  }

  onSelect(factura: IFactura): void {
    this.dialogRef?.close(factura);
  }

}
