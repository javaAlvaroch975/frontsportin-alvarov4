import { IClub } from "./club";


export interface INoticia{
  id: number;
  titulo: string;
  contenido: string;
  fecha: Date;
  imagen: any | null;
  club: IClub;
  comentarios: number;
  puntuaciones: number | null;
}


