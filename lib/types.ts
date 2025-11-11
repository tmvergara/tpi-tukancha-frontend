export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "socio";
  club_id: number;
}

export interface Horario {
  id: number;
  dia: string;
  abre: string;
  cierra: string;
  activo: boolean;
}

export interface Club {
  id: number;
  nombre: string;
  cuit: string;
  telefono: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    pais: string;
  };
  horarios: Horario[];
}
