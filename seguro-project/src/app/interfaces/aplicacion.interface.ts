import { AplicacionDetalle } from './aplicacion-detalle';

export interface Aplicacion {
  registro?: number;
  fecha: Date;
  parcela_id: number;
  observaciones?: string;
  detalles?: AplicacionDetalle[];
  // Campos adicionales para el reporte
  receta_nro?: string;
  fecha_exp?: string;
  reg_producto?: string;
  entidad_comercializadora?: string;
  productor?: string;
  departamento?: string;
  distrito?: string;
  localidad?: string;
  matricula_profesional?: string;
  registro_senave?: string;
  created_at?: string;
  updated_at?: string;
  // Campos para el formulario
  producto?: string;
  descripcion?: string;
  parcela_nro?: string;
  ingrediente_activo?: string;
  dosis?: number;
  objetivo?: string;
  tipo_pico?: string;
  vol_agua?: number;
  temperatura?: number;
  humedad?: number;
  velocidad_viento?: number;
}
