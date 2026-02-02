export interface IClub {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    fechaAlta: Date;
    imagen: string | null;
    temporadas: number;
    noticias: number;
    tipoarticulos: number;
    usuarios: number;
}
