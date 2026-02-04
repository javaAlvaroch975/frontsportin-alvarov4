import { IEquipo } from "./equipo";

export interface ILiga {
    id: number;
    nombre: string;
    equipo: IEquipo;
    partidos: number;
}

