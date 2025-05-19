const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Evento cuando hay un error en el pool
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL', err);
});

// Test de conexión
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error al conectar a PostgreSQL:', err);
    } else {
        console.log('Conexión a PostgreSQL exitosa');
    }
});

module.exports = {
    query: async (text, params) => {
        try {
            const start = Date.now();
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Consulta ejecutada:', { text, duration, rows: res.rowCount });
            return res;
        } catch (err) {
            console.error('Error en la consulta:', err);
            throw err;
        }
    },
    pool
};
