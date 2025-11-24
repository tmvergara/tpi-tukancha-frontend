export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "encargado" | "org_torneos";
  club_id: number;
  club_nombre?: string;
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

// Tipos para Reportes
export interface ReservaReporte {
  id: number;
  cancha_id: number;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  precio_total: string;
  fuente: string;
  servicios: string;
  estado: string;
  created_at: string;
  timeslots: any[];
}

export interface ReservasPorCliente {
  cliente_email: string;
  cliente_nombre: string;
  cliente_telefono: string;
  reservas: ReservaReporte[];
}

export interface CanchaReporte {
  id: number;
  nombre: string;
  deporte: string;
  precio_hora: string;
}

export interface ReservasPorCancha {
  cancha: CanchaReporte;
  total_reservas: number;
  total_ingresos: string;
  reservas: ReservaReporte[];
}

export interface CanchaMasUtilizada {
  cancha: CanchaReporte;
  reservas_count: number;
  total_ingresos: string;
  porcentaje_utilizacion: string;
}

export interface UtilizacionMensual {
  months: string[];
  series: {
    cancha: {
      id: number;
      nombre: string;
      deporte: string;
    };
    data: number[];
  }[];
}
