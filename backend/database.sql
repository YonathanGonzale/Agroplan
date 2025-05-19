-- Eliminar la tabla si existe
DROP TABLE IF EXISTS proveedores;

-- Crear la tabla proveedores
CREATE TABLE proveedores (
    codigo INTEGER PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(200)
);
