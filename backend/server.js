require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const errorHandler = require('./middleware/error.middleware');
const aplicacionesRouter = require('./routes/aplicaciones');
const productosRouter = require('./routes/productos');
const authRouter = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de seguridad
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana por IP
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Registrar rutas
app.use('/api/auth', authRouter);
app.use('/api/aplicaciones', aplicacionesRouter);
app.use('/api/productos', productosRouter);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});

// Obtener todos los proveedores con paginación y búsqueda
app.get('/api/proveedores', async (req, res) => {
    try {
        const { busqueda, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM proveedores';
        let countQuery = 'SELECT COUNT(*) FROM proveedores';
        const queryParams = [];

        if (busqueda) {
            query += ' WHERE descripcion ILIKE $1';
            countQuery += ' WHERE descripcion ILIKE $1';
            queryParams.push(`%${busqueda}%`);
        }

        query += ' ORDER BY codigo LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(limit, offset);

        const [proveedores, totalCount] = await Promise.all([
            db.query(query, queryParams),
            db.query(countQuery, busqueda ? [queryParams[0]] : [])
        ]);

        res.json({
            items: proveedores.rows,
            total: parseInt(totalCount.rows[0].count)
        });
    } catch (err) {
        console.error('Error en GET /api/proveedores:', err);
        res.status(500).json({ error: err.message });
    }
});

// Crear un nuevo proveedor
app.post('/api/proveedores', async (req, res) => {
    try {
        const { descripcion, correo, telefono, direccion } = req.body;
        
        // Obtener el siguiente código disponible
        const maxCodigoResult = await db.query('SELECT MAX(codigo) FROM proveedores');
        const nextCodigo = (maxCodigoResult.rows[0].max || 0) + 1;

        const result = await db.query(
            'INSERT INTO proveedores (codigo, descripcion, correo, telefono, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nextCodigo, descripcion, correo, telefono, direccion]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error en POST /api/proveedores:', err);
        res.status(500).json({ error: err.message });
    }
});

// Actualizar un proveedor
app.put('/api/proveedores/:codigo', async (req, res) => {
    try {
        const { codigo: codigoParam } = req.params;
        const { descripcion, correo, telefono, direccion } = req.body;
        const result = await db.query(
            'UPDATE proveedores SET descripcion = $1, correo = $2, telefono = $3, direccion = $4 WHERE codigo = $5 RETURNING *',
            [descripcion, correo, telefono, direccion, codigoParam]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en PUT /api/proveedores/:codigo:', err);
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un proveedor
app.delete('/api/proveedores/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const result = await db.query('DELETE FROM proveedores WHERE codigo = $1 RETURNING *', [codigo]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (err) {
        console.error('Error en DELETE /api/proveedores/:codigo:', err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener todas las parcelas (con paginación)
app.get('/api/parcelas', async (req, res) => {
    try {
        const { busqueda, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let queryCount = 'SELECT COUNT(*) as total FROM parcelas';
        let queryData = 'SELECT * FROM parcelas';
        let paramsCount = [];
        let paramsData = [];
        let whereClause = '';

        if (busqueda) {
            whereClause = `WHERE CAST("REGISTRO" AS TEXT) LIKE $1 OR 
                        LOWER(DESC_LOTE) LIKE LOWER($1) OR 
                        LOWER("LOTE") LIKE LOWER($1) OR
                        LOWER("LOCALIDAD") LIKE LOWER($1) OR
                        LOWER("DITRITO") LIKE LOWER($1) OR
                        LOWER(CLIENTE) LIKE LOWER($1)`;
            queryCount = `SELECT COUNT(*) as total FROM parcelas ${whereClause}`;
            queryData = `SELECT * FROM parcelas ${whereClause}`;
            paramsCount = [`%${busqueda}%`];
            paramsData = [`%${busqueda}%`];
        }

        // Añadir paginación a la consulta de datos
        queryData += ` ORDER BY "REGISTRO" LIMIT $${paramsData.length + 1} OFFSET $${paramsData.length + 2}`;
        paramsData.push(parseInt(limit), parseInt(offset));

        // Ejecutar consulta para obtener total de registros
        const countResult = await db.query(queryCount, paramsCount);
        const total = parseInt(countResult.rows[0].total);

        // Ejecutar consulta para obtener datos paginados
        const dataResult = await db.query(queryData, paramsData);
        
        // Devolver datos con metadatos de paginación
        res.json({
            data: dataResult.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error en GET /api/parcelas:', err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener una parcela por registro
app.get('/api/parcelas/:registro', async (req, res) => {
    try {
        const { registro } = req.params;
        const result = await db.query('SELECT * FROM parcelas WHERE "REGISTRO" = $1', [registro]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parcela no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en GET /api/parcelas/:registro:', err);
        res.status(500).json({ error: err.message });
    }
});

// Crear una nueva parcela
app.post('/api/parcelas', async (req, res) => {
    try {
        const { DESC_LOTE, LOTE, SUPERFICIE, LOCALIDAD, DITRITO, CLIENTE } = req.body;
        
        // Obtener el siguiente registro disponible
        const maxRegistroResult = await db.query('SELECT MAX("REGISTRO") FROM parcelas');
        const nextRegistro = (maxRegistroResult.rows[0].max || 0) + 1;

        const result = await db.query(
            'INSERT INTO parcelas ("REGISTRO", DESC_LOTE, "LOTE", "SUPERFICIE", "LOCALIDAD", "DITRITO", CLIENTE) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nextRegistro, DESC_LOTE, LOTE, SUPERFICIE, LOCALIDAD, DITRITO, CLIENTE]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error en POST /api/parcelas:', err);
        res.status(500).json({ error: err.message });
    }
});

// Actualizar una parcela
app.put('/api/parcelas/:registro', async (req, res) => {
    try {
        const { registro } = req.params;
        const { DESC_LOTE, LOTE, SUPERFICIE, LOCALIDAD, DISTRITO, CLIENTE } = req.body;
        
        console.log('Datos recibidos:', { registro, DESC_LOTE, LOTE, SUPERFICIE, LOCALIDAD, DISTRITO, CLIENTE });
        
        const result = await db.query(
            'UPDATE parcelas SET "DESC_LOTE" = $1, "LOTE" = $2, "SUPERFICIE" = $3, "LOCALIDAD" = $4, "DISTRITO" = $5, "CLIENTE" = $6 WHERE "REGISTRO" = $7 RETURNING *',
            [DESC_LOTE, LOTE, SUPERFICIE, LOCALIDAD, DISTRITO, CLIENTE, registro]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parcela no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en PUT /api/parcelas/:registro:', err);
        res.status(500).json({ error: err.message });
    }
});

// Eliminar una parcela
app.delete('/api/parcelas/:registro', async (req, res) => {
    try {
        const { registro } = req.params;
        const result = await db.query('DELETE FROM parcelas WHERE "REGISTRO" = $1 RETURNING *', [registro]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parcela no encontrada' });
        }
        
        res.json({ message: 'Parcela eliminada correctamente' });
    } catch (err) {
        console.error('Error en DELETE /api/parcelas/:registro:', err);
        res.status(500).json({ error: err.message });
    }
});

// Iniciar el servidor (solo una vez)
// Endpoints para aplicadores
app.get('/api/aplicadores', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = 'SELECT * FROM aplicadores';
        let countQuery = 'SELECT COUNT(*) FROM aplicadores';
        let params = [];

        if (search) {
            query += ` WHERE CAST(codigo AS TEXT) LIKE $1 OR 
                      LOWER(descripcion) LIKE LOWER($1) OR 
                      LOWER(correo) LIKE LOWER($1)`;
            countQuery += ` WHERE CAST(codigo AS TEXT) LIKE $1 OR 
                      LOWER(descripcion) LIKE LOWER($1) OR 
                      LOWER(correo) LIKE LOWER($1)`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY codigo DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [result, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, search ? [params[0]] : [])
        ]);

        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (err) {
        console.error('Error en GET /api/aplicadores:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/aplicadores/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const result = await db.query('SELECT * FROM aplicadores WHERE codigo = $1', [codigo]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicador no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en GET /api/aplicadores/:codigo:', err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los aplicadores con paginación y búsqueda
app.get('/api/aplicadores', async (req, res) => {
    try {
        const { busqueda, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM aplicadores';
        let countQuery = 'SELECT COUNT(*) FROM aplicadores';
        const queryParams = [];

        if (busqueda) {
            query += ' WHERE descripcion ILIKE $1';
            countQuery += ' WHERE descripcion ILIKE $1';
            queryParams.push(`%${busqueda}%`);
        }

        query += ' ORDER BY codigo LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(limit, offset);

        const [aplicadores, totalCount] = await Promise.all([
            db.query(query, queryParams),
            db.query(countQuery, busqueda ? [queryParams[0]] : [])
        ]);

        res.json({
            items: aplicadores.rows,
            total: parseInt(totalCount.rows[0].count)
        });
    } catch (err) {
        console.error('Error en GET /api/aplicadores:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/aplicadores', async (req, res) => {
    try {
        const { descripcion, correo, telefono, direccion } = req.body;
        
        const result = await db.query(
            'INSERT INTO aplicadores (descripcion, correo, telefono, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
            [descripcion, correo, telefono, direccion]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error en POST /api/aplicadores:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/aplicadores/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const { descripcion, correo, telefono, direccion } = req.body;
        
        const result = await db.query(
            'UPDATE aplicadores SET descripcion = $1, correo = $2, telefono = $3, direccion = $4 WHERE codigo = $5 RETURNING *',
            [descripcion, correo, telefono, direccion, codigo]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicador no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en PUT /api/aplicadores/:codigo:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/aplicadores/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const result = await db.query('DELETE FROM aplicadores WHERE codigo = $1 RETURNING *', [codigo]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicador no encontrado' });
        }
        
        res.json({ message: 'Aplicador eliminado correctamente' });
    } catch (err) {
        console.error('Error en DELETE /api/aplicadores/:codigo:', err);
        res.status(500).json({ error: err.message });
    }
});

// El servidor ya está iniciado arriba