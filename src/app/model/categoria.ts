export interface ICategoria {
  id: number
  nombre: string
  temporada: ITemporada
  equipos: number
}

export interface ITemporada {
  id: number
  nombre?: string
}