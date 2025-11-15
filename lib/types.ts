export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "encargado" | "org_torneos";
  club_id: number;
  telefono?: string;
  activo?: boolean;
}

export interface UserDetailed {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  club: {
    id: number;
    nombre: string;
    cuit?: string;
    telefono?: string;
    direccion_id?: number;
  };
  rol: {
    id: number;
    nombre: "admin" | "encargado" | "org_torneos";
  };
  created_at: string;
  updated_at: string;
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

// Tipos para disponibilidad de canchas
export interface Cancha {
  timeslot_id: number;
  cancha_id: number;
  nombre: string;
  deporte: string;
  techado: boolean;
  iluminacion: boolean;
  superficie: number;
  precio: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface HorarioDisponibilidad {
  hora: string;
  total_disponibles: number;
  canchas_disponibles: Cancha[];
}

export interface DisponibilidadResponse {
  club_id: number;
  fecha: string;
  horarios: HorarioDisponibilidad[];
}

// Tipo para la respuesta de creación de reserva
export interface ReservaResponse {
  id: number;
  cancha: {
    id: number;
    nombre: string;
    deporte: string;
    superficie: number;
    techado: boolean;
    iluminacion: boolean;
    precio_hora: number;
    club_id: number;
    activa: boolean;
  };
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  estado: string;
  fuente: string;
  servicios: string;
  precio_total: number;
  created_at: string;
  updated_at: string;
}

// Tipo para la respuesta de preferencia de pago
export interface PreferenciaPagoResponse {
  preference_id: string;
  init_point: string;
  sandbox_init_point: string;
}
