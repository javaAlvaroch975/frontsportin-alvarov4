import { IClub } from "./club"

export interface ITemporada {
    id: number
    descripcion: string
    club: IClub
    categorias: number
}

