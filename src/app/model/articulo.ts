import { ITipoarticulo } from "./tipoarticulo"

export interface IArticulo {
  id: number
  descripcion: string
  precio: number
  descuento: number
  imagen: any
  tipoarticulo: ITipoarticulo
  comentarioarts: number
  compras: number
  carritos: number
}







