const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = 'SELECT * FROM proveedores';
        let countQuery = 'SELECT COUNT(*) FROM proveedores';
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

        const [proveedores, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, search ? [params[0]] : [])
        ]);

        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            data: proveedores.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit
            }
        });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
