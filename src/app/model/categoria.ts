import { ITemporada } from "./temporada"

export interface ICategoria {
  id: number
  nombre: string
  temporada: ITemporada
  equipos: number
}

