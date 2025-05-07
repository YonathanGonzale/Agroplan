export interface AplicacionDetalle {
    fecha?: Date;
    cultivo?: string;
    area?: number;
    nombre_comercial?: string;
    ingrediente_activo?: string;
    dosis?: number;
    objetivo_aplicacion?: string;
    nombre_aplicador?: string;
    epi_usado?: boolean;
    tipo_pico?: string;
    vol_agua?: number;
    temperatura?: number;
    humedad?: number;
}
