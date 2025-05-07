const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM productos ORDER BY "REGISTRO" DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un producto por registro
router.get('/:registro', async (req, res) => {
  try {
    const { registro } = req.params;
    const result = await db.query('SELECT * FROM productos WHERE "REGISTRO" = $1', [registro]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { DESCRIPCION, INGREDIENTE_ACTI, PRODUCTO } = req.body;
    const result = await db.query(
      'INSERT INTO productos ("DESCRIPCION", "INGREDIENTE_ACTI", "PRODUCTO") VALUES ($1, $2, $3) RETURNING *',
      [DESCRIPCION, INGREDIENTE_ACTI, PRODUCTO]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un producto
router.put('/:registro', async (req, res) => {
  try {
    const { registro } = req.params;
    const { DESCRIPCION, INGREDIENTE_ACTI, PRODUCTO } = req.body;
    const result = await db.query(
      'UPDATE productos SET "DESCRIPCION" = $1, "INGREDIENTE_ACTI" = $2, "PRODUCTO" = $3 WHERE "REGISTRO" = $4 RETURNING *',
      [DESCRIPCION, INGREDIENTE_ACTI, PRODUCTO, registro]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un producto
router.delete('/:registro', async (req, res) => {
  try {
    const { registro } = req.params;
    const result = await db.query('DELETE FROM productos WHERE "REGISTRO" = $1 RETURNING *', [registro]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
