import { IUsuario } from "./usuario"

export interface IFactura {
  id: number
  fecha: string
  usuario: IUsuario
  compras: number
}
