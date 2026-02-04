import { IArticulo } from "./articulo"
import { IUsuario } from "./usuario"

export interface IComentarioart {
    id: number
    contenido: string
    idArticulo: number
    idUsuario: number
    articulo?: IArticulo
    usuario?: IUsuario
}
