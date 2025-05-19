CREATE TABLE aplicaciones (
    registro SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    cultivo VARCHAR(50),
    area NUMERIC(10,2),
    producto VARCHAR(100),
    ingrediente_activo VARCHAR(100),
    dosis VARCHAR(50),
    objetivo VARCHAR(200),
    aplicador VARCHAR(100),
    epi_usado BOOLEAN DEFAULT true,
    tipo_pico VARCHAR(50),
    vol_agua NUMERIC(10,2),
    temperatura NUMERIC(5,2),
    humedad NUMERIC(5,2),
    velocidad_viento NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
