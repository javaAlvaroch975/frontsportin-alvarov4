import { ICuota } from "./cuota";
import { IJugador } from "./jugador";

export interface IPago {
  id: number;
  cuota: ICuota;
  jugador: IJugador;
  abonado: number;
  fecha: string;
}

