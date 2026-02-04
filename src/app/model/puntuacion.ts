
import { INoticia } from "./noticia"
import { IUsuario } from "./usuario"

export interface IPuntuacion {
  id: number
  puntuacion: number
  noticia: INoticia
  usuario: IUsuario
}