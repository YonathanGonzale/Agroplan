const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20, // máximo número de clientes en el pool
    idleTimeoutMillis: 30000, // tiempo máximo que un cliente puede estar inactivo
    connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getPool: () => pool,
};
