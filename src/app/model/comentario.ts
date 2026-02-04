import { INoticia } from './noticia';
import { IUsuario } from './usuario';

export interface IComentario {
    id: number,
    contenido: string,
    noticia: INoticia,
    usuario: IUsuario,
}

