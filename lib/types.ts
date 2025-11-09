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
}
