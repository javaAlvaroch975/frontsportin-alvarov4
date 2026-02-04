import { IEquipo } from "./equipo"

export interface ICuota {
  id: number
  descripcion: string
  cantidad: number
  fecha: string
  equipo: IEquipo
  pagos: number
}
