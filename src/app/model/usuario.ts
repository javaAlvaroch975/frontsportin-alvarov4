import { IClub } from "./club"
import { IRolusuario } from "./rolusuario"
import { ITipousuario } from "./tipousuario"


export interface IUsuario {
  id: number
  nombre: string
  apellido1: string
  apellido2: string
  username: string
  password: string
  fechaAlta: string
  genero: number
  tipousuario: ITipousuario
  rolusuario: IRolusuario
  club: IClub
  comentarios: number
  puntuaciones: number
  comentarioarts: number
  carritos: number
  facturas: number
  equiposentrenados: number
  jugadores: number
}

