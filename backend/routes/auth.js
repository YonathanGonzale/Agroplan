const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

// Credenciales temporales para desarrollo
const TEMP_USER = {
    username: 'admin',
    // Generamos un nuevo hash para 'admin123'
    password: bcrypt.hashSync('admin123', 10)
};

router.post('/login', async (req, res) => {
    console.log('Recibida solicitud de login:', req.body);
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            console.log('Faltan credenciales');
            return res.status(400).json({ message: 'Se requieren usuario y contraseña' });
        }

        console.log('Verificando usuario:', username);

        // Por ahora, usamos credenciales temporales
        if (username !== TEMP_USER.username) {
            console.log('Usuario no encontrado:', username);
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        console.log('Verificando contraseña');
        const isValid = bcrypt.compareSync(password, TEMP_USER.password);
        
        console.log('¿Contraseña válida?', isValid);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: 1, username: TEMP_USER.username },
            'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login exitoso para:', username);

        res.json({
            id: 1,
            username: TEMP_USER.username,
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error en el servidor',
            error: error.message 
        });
    }
});

module.exports = router;
