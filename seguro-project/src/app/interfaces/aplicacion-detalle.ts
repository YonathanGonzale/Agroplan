export interface AplicacionDetalle {
  registro?: number;
  aplicacion_id: number;
  fecha?: Date;
  cultivo: string;
  area: number;
  producto_id?: number;
  nombre_comercial: string;
  ingrediente_activo: string;
  dosis: number;
  objetivo_aplicacion: string;
  nombre_aplicador: string;
  epi_usado: boolean;
  tipo_pico: string;
  vol_agua: number;
  temperatura: number;
  humedad: number;
  velocidad_viento: number;
  created_at?: Date;
  updated_at?: Date;
}
