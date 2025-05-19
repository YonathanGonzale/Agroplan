const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las parcelas
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = 'SELECT * FROM parcelas';
        let countQuery = 'SELECT COUNT(*) FROM parcelas';
        let params = [];

        if (search) {
            query += ` WHERE CAST(id AS TEXT) LIKE $1 OR 
                    LOWER(nombre) LIKE LOWER($1) OR 
                    LOWER(ubicacion) LIKE LOWER($1)`;
            countQuery += ` WHERE CAST(id AS TEXT) LIKE $1 OR 
                    LOWER(nombre) LIKE LOWER($1) OR 
                    LOWER(ubicacion) LIKE LOWER($1)`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY id DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [parcelas, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, search ? [params[0]] : [])
        ]);

        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            data: parcelas.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit
            }
        });
    } catch (error) {
        console.error('Error al obtener parcelas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
