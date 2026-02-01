export interface noticiaModel{
  id: number;
  titulo: string;
  contenido: string;
  fecha: Date;
  imagen: any | null;
  club: IClubModel;
  comentarios: number;
  puntuaciones: number | null;
}

// Temporales

export interface IClubModel {
  id: number;
  nombre?: string;
}
