const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');

// Obtener todas las aplicaciones con paginación y búsqueda
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT 
                "REGISTRO",
                "FECHA",
                "CULTIVO",
                "AREA",
                "PRODUTO",
                "DESCRICAO",
                "INGREDIENTE_ACTIVO",
                "DOSIS",
                "OBJETIVO",
                "APLICADOR",
                "EPI",
                "TIPO_PICO",
                "VOL_AGUA",
                "TEMPERATURA",
                "HUMEDAD",
                "VIENTO",
                "RECETA_NRO",
                "FECHA_EXP"
            FROM aplicaciones`;
        let countQuery = 'SELECT COUNT(*) FROM aplicaciones';
        let params = [];

        if (search) {
            query += ` WHERE 
                CAST("REGISTRO" AS TEXT) LIKE $1 OR 
                LOWER("CULTIVO") LIKE LOWER($1) OR 
                LOWER("PRODUTO") LIKE LOWER($1) OR
                LOWER("APLICADOR") LIKE LOWER($1)`;
            countQuery += ` WHERE 
                CAST("REGISTRO" AS TEXT) LIKE $1 OR 
                LOWER("CULTIVO") LIKE LOWER($1) OR 
                LOWER("PRODUTO") LIKE LOWER($1) OR
                LOWER("APLICADOR") LIKE LOWER($1)`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY "REGISTRO" DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [result, countResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, search ? [params[0]] : [])
        ]);

        res.json({
            items: result.rows,
            total: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        console.error('Error en GET /api/aplicaciones:', err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener una aplicación específica
router.get('/:registro', async (req, res) => {
    try {
        const { registro } = req.params;
        const query = `
            SELECT 
                "REGISTRO" as registro,
                "FECHA" as fecha,
                "CULTIVO" as cultivo,
                "AREA" as area,
                "PRODUTO" as producto,
                "DESCRICAO" as descripcion,
                "INGREDIENTE_ACTIVO" as ingrediente_activo,
                "DOSIS" as dosis,
                "OBJETIVO" as objetivo,
                "APLICADOR" as aplicador,
                "EPI" as epi_usado,
                "TIPO_PICO" as tipo_pico,
                "VOL_AGUA" as vol_agua,
                "TEMPERATURA" as temperatura,
                "HUMEDAD" as humedad,
                "VIENTO" as velocidad_viento,
                "PRODUCTOR" as productor,
                "DEPARTAMENTO" as departamento,
                "DISTRITO" as distrito,
                "LOCALIDAD" as localidad,
                "PARCELA_NRO" as parcela_nro,
                "MATRICULA_PROFESIONAL" as matricula_profesional,
                "REGISTRO_SENAVE" as registro_senave,
                "ENTIDAD_COMERCIALIZADORA" as entidad_comercializadora,
                "REG_PRODUCTO" as reg_producto,
                "RECETA_NRO" as receta_nro,
                "FECHA_EXP" as fecha_exp
            FROM aplicaciones
            WHERE "REGISTRO" = $1`;
        
        const result = await db.query(query, [registro]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicación no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error en GET /api/aplicaciones/:registro:', err);
        res.status(500).json({ error: err.message });
    }
});

// Crear una nueva aplicación
router.post('/', async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        const {
            fecha,
            cultivo,
            area,
            producto,
            descripcion,
            ingrediente_activo,
            dosis,
            objetivo,
            aplicador,
            epi_usado,
            tipo_pico,
            vol_agua,
            temperatura,
            humedad,
            velocidad_viento,
            productor,
            departamento,
            distrito,
            localidad,
            parcela_nro,
            entidad_comercializadora,
            reg_producto,
            receta_nro,
            fecha_exp
        } = req.body;

        // Validar y asignar valores por defecto para campos opcionales
        const safeEntidadComercializadora = entidad_comercializadora || null;
        const safeRegProducto = reg_producto || null;
        const safeRecetaNro = receta_nro || null;
        const safeFechaExp = fecha_exp || null;

        const query = `
            INSERT INTO aplicaciones (
                "REGISTRO",
                "FECHA",
                "CULTIVO",
                "AREA",
                "PRODUTO",
                "DESCRICAO",
                "INGREDIENTE_ACTIVO",
                "DOSIS",
                "OBJETIVO",
                "APLICADOR",
                "EPI",
                "TIPO_PICO",
                "VOL_AGUA",
                "TEMPERATURA",
                "HUMEDAD",
                "VIENTO",
                "PRODUCTOR",
                "DEPARTAMENTO",
                "DISTRITO",
                "LOCALIDAD",
                "PARCELA_NRO",
                "MATRICULA_PROFESIONAL",
                "REGISTRO_SENAVE",
                "ENTIDAD_COMERCIALIZADORA",
                "REG_PRODUCTO",
                "RECETA_NRO",
                "FECHA_EXP"
            ) VALUES (
                COALESCE((SELECT MAX("REGISTRO") FROM aplicaciones), 0) + 1,
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
            ) RETURNING *`;

        const values = [
            fecha,
            cultivo,
            area,
            producto,
            descripcion,
            ingrediente_activo,
            dosis,
            objetivo,
            aplicador,
            epi_usado,
            tipo_pico,
            vol_agua,
            temperatura,
            humedad,
            velocidad_viento,
            productor,
            departamento,
            distrito,
            localidad,
            parcela_nro,
            '354', // MATRICULA_PROFESIONAL
            '2',   // REGISTRO_SENAVE
            safeEntidadComercializadora,
            safeRegProducto,
            safeRecetaNro,
            safeFechaExp,
            'Ing. Agr. Victor Garay M.' // ASESOR_TECNICO
        ];

        const result = await db.query(query, values);
        res.status(201).json({
            registro: result.rows[0].REGISTRO,
            fecha: result.rows[0].FECHA,
            cultivo: result.rows[0].CULTIVO,
            area: result.rows[0].AREA,
            producto: result.rows[0].PRODUTO,
            descripcion: result.rows[0].DESCRICAO,
            ingrediente_activo: result.rows[0].INGREDIENTE_ACTIVO,
            dosis: result.rows[0].DOSIS,
            objetivo: result.rows[0].OBJETIVO,
            aplicador: result.rows[0].APLICADOR,
            epi_usado: result.rows[0].EPI,
            tipo_pico: result.rows[0].TIPO_PICO,
            vol_agua: result.rows[0].VOL_AGUA,
            temperatura: result.rows[0].TEMPERATURA,
            humedad: result.rows[0].HUMEDAD,
            velocidad_viento: result.rows[0].VIENTO
        });
    } catch (error) {
        console.error('Error al crear aplicación:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una aplicación
router.put('/:registro', async (req, res) => {
    try {
        console.log('PUT - Datos recibidos:', req.body);
        console.log('PUT - Registro a actualizar:', req.params.registro);
        const { registro } = req.params;
        const {
            fecha,
            cultivo,
            area,
            producto,
            descripcion,
            ingrediente_activo,
            dosis,
            objetivo,
            aplicador,
            epi_usado,
            tipo_pico,
            vol_agua,
            temperatura,
            humedad,
            velocidad_viento,
            productor,
            departamento,
            distrito,
            localidad,
            parcela_nro,
            entidad_comercializadora,
            reg_producto,
            receta_nro,
            fecha_exp
        } = req.body;

        // Validar y asignar valores por defecto para campos opcionales
        const safeEntidadComercializadora = entidad_comercializadora || null;
        const safeRegProducto = reg_producto || null;
        const safeRecetaNro = receta_nro || null;
        const safeFechaExp = fecha_exp || null;

        const query = `
            UPDATE aplicaciones SET
                "FECHA" = $1,
                "CULTIVO" = $2,
                "AREA" = $3,
                "PRODUTO" = $4,
                "DESCRICAO" = $5,
                "INGREDIENTE_ACTIVO" = $6,
                "DOSIS" = $7,
                "OBJETIVO" = $8,
                "APLICADOR" = $9,
                "EPI" = $10,
                "TIPO_PICO" = $11,
                "VOL_AGUA" = $12,
                "TEMPERATURA" = $13,
                "HUMEDAD" = $14,
                "VIENTO" = $15,
                "PRODUCTOR" = $16,
                "DEPARTAMENTO" = $17,
                "DISTRITO" = $18,
                "LOCALIDAD" = $19,
                "PARCELA_NRO" = $20,
                "MATRICULA_PROFESIONAL" = $21,
                "REGISTRO_SENAVE" = $22,
                "ENTIDAD_COMERCIALIZADORA" = $23,
                "REG_PRODUCTO" = $24,
                "RECETA_NRO" = $25,
                "FECHA_EXP" = $26
            WHERE "REGISTRO" = $27
            RETURNING *`;

        const values = [
            fecha,
            cultivo,
            area,
            producto,
            descripcion,
            ingrediente_activo,
            dosis,
            objetivo,
            aplicador,
            epi_usado,
            tipo_pico,
            vol_agua,
            temperatura,
            humedad,
            velocidad_viento,
            productor,
            departamento,
            distrito,
            localidad,
            parcela_nro,
            '354', // MATRICULA_PROFESIONAL
            '2',   // REGISTRO_SENAVE
            safeEntidadComercializadora,
            safeRegProducto,
            safeRecetaNro,
            safeFechaExp,
            registro
        ];

        console.log('Query:', query);
        console.log('Values:', values);
        const result = await db.query(query, values);
        console.log('Resultado:', result.rows[0]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicación no encontrada' });
        }

        res.json({
            registro: result.rows[0].REGISTRO,
            fecha: result.rows[0].FECHA,
            cultivo: result.rows[0].CULTIVO,
            area: result.rows[0].AREA,
            producto: result.rows[0].PRODUTO,
            descripcion: result.rows[0].DESCRICAO,
            ingrediente_activo: result.rows[0].INGREDIENTE_ACTIVO,
            dosis: result.rows[0].DOSIS,
            objetivo: result.rows[0].OBJETIVO,
            aplicador: result.rows[0].APLICADOR,
            epi_usado: result.rows[0].EPI,
            tipo_pico: result.rows[0].TIPO_PICO,
            vol_agua: result.rows[0].VOL_AGUA,
            temperatura: result.rows[0].TEMPERATURA,
            humedad: result.rows[0].HUMEDAD,
            velocidad_viento: result.rows[0].VIENTO
        });
    } catch (err) {
        console.error('Error al actualizar aplicación:', err);
        res.status(500).json({ error: err.message });
    }
});

// Eliminar una aplicación
router.delete('/:registro', async (req, res) => {
    try {
        const { registro } = req.params;
        const query = 'DELETE FROM aplicaciones WHERE "REGISTRO" = $1 RETURNING *';
        const result = await db.query(query, [registro]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicación no encontrada' });
        }

        res.json({ message: 'Aplicación eliminada exitosamente' });
    } catch (err) {
        console.error('Error al eliminar aplicación:', err);
        res.status(500).json({ error: err.message });
    }
});

// Exportar todas las aplicaciones a Excel
router.get('/export/excel', async (req, res) => {
    try {
        const query = `
            SELECT 
                "REGISTRO" as registro,
                TO_CHAR("FECHA", 'YYYY-MM-DD') as fecha,
                "CULTIVO" as cultivo,
                "AREA" as area,
                "PRODUTO" as producto,
                "DESCRICAO" as descripcion,
                "INGREDIENTE_ACTIVO" as ingrediente_activo,
                "DOSIS" as dosis,
                "OBJETIVO" as objetivo,
                "APLICADOR" as aplicador,
                "EPI" as epi_usado,
                "TIPO_PICO" as tipo_pico,
                "VOL_AGUA" as vol_agua,
                "TEMPERATURA" as temperatura,
                "HUMEDAD" as humedad,
                "VIENTO" as velocidad_viento
            FROM aplicaciones
            ORDER BY "REGISTRO" DESC`;

        const result = await db.query(query);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Aplicaciones');

        // Título principal
        worksheet.mergeCells('A1:N1');
        worksheet.getCell('A1').value = 'REGISTRO DE APLICACIÓN DE AGROQUÍMICOS DE FRANJA ROJA (AÉREAS Y TERRESTRE)';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Información del encabezado
        worksheet.getCell('A2').value = 'PRODUCTOR:';
        worksheet.getCell('B2').value = result.rows[0]?.PRODUCTOR || '';
        worksheet.getCell('A3').value = 'Departamento:';
        worksheet.getCell('B3').value = result.rows[0]?.DEPARTAMENTO || '';
        worksheet.getCell('A4').value = 'Distrito:';
        worksheet.getCell('B4').value = result.rows[0]?.DISTRITO || '';
        worksheet.getCell('A5').value = 'Localidad:';
        worksheet.getCell('B5').value = result.rows[0]?.LOCALIDAD || '';
        worksheet.getCell('A6').value = 'Parcela N°:';
        worksheet.getCell('B6').value = result.rows[0]?.PARCELA_NRO || '';

        worksheet.getCell('H2').value = 'ASESOR TÉCNICO:';
        worksheet.getCell('I2').value = 'Ing. Agr. Victor Garry M.';
        worksheet.getCell('H3').value = 'Matrícula Profesional:';
        worksheet.getCell('I3').value = '354';
        worksheet.getCell('H4').value = 'Registro SENAVE N°:';
        worksheet.getCell('I4').value = '2';

        worksheet.getCell('K2').value = 'RECETA AGRONÓMICA N°:';
        worksheet.getCell('L2').value = result.rows[0]?.RECETA_NRO || '';
        worksheet.getCell('K3').value = 'Fecha Expedición:';
        worksheet.getCell('L3').value = result.rows[0]?.FECHA_EXP || '';
        worksheet.getCell('K4').value = 'Entidad Comercializadora:';
        worksheet.getCell('L4').value = result.rows[0]?.ENTIDAD_COMERCIALIZADORA || '';
        worksheet.getCell('K5').value = 'Reg. Producto N°:';
        worksheet.getCell('L5').value = result.rows[0]?.REG_PRODUCTO || '';

        // Tabla principal - headers
        const headerRow = 8;
        const headers = [
            ['Fecha', 'Descripción del Área de Aplicación', '', 'Descripción del Producto', '', 'Descripción del Tratamiento', '', '', 'Tecnología de Aplicación', '', '', 'Condiciones Climáticas', '', ''],
            ['', 'Cultivo', 'Área (Ha)', 'Nombre Comercial', 'Ingrediente Activo % Registro', 'Dosis (l/Ha)', 'Objetivos de la Aplicación', 'Nombre y Apellido del Aplicador', 'E.P.I. Usado S/N', 'Tipo de Pico', 'Vol. de Agua Utilizado L/Ha', 'T°', 'H%', 'Viento Km/h']
        ];

        headers.forEach((header, index) => {
            worksheet.getRow(headerRow + index).values = header;
        });

        // Datos
        const rows = result.rows;
        rows.forEach((row, index) => {
            worksheet.getRow(headerRow + 2 + index).values = [
                row.FECHA,
                row.CULTIVO,
                row.AREA,
                row.PRODUTO || '', // Nombre Comercial
                row.INGREDIENTE_ACTIVO || '',
                row.DOSIS || '',
                row.OBJETIVO || '',
                row.APLICADOR || '',
                row.EPI ? 'S' : 'N',
                row.TIPO_PICO || '',
                row.VOL_AGUA || '',
                row.TEMPERATURA || '',
                row.HUMEDAD || '',
                row.VIENTO || ''
            ];
        });

        // Formato
        worksheet.getRow(headerRow).font = { bold: true };
        worksheet.getRow(headerRow + 1).font = { bold: true };

        // Bordes y alineación
        for (let i = headerRow; i <= headerRow + 1 + rows.length; i++) {
            worksheet.getRow(i).eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            });
        }

        // Ajustar anchos de columna
        worksheet.columns.forEach((column) => {
            column.width = 15;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=aplicaciones.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al exportar las aplicaciones:', error);
        res.status(500).json({ message: 'Error al exportar las aplicaciones' });
    }
});

// Actualizar un detalle de aplicación
router.put('/:registro/detalles/:detalleId', async (req, res) => {
    try {
        const { registro, detalleId } = req.params;
        const {
            CULTIVO,
            AREA,
            NOMBRE_COMERCIAL,
            INGREDIENTE_ACTIVO,
            DOSIS,
            OBJETIVO,
            NOMBRE_APLICADOR,
            EPI_USADO,
            TIPO_PICO,
            VOL_AGUA,
            TEMPERATURA,
            HUMEDAD,
            VELOCIDAD_VIENTO
        } = req.body;

        console.log('Actualizando detalle:', {
            registro,
            detalleId,
            body: req.body
        });

        const query = `
            UPDATE aplicaciones_detalles SET
                "CULTIVO" = $1,
                "AREA" = $2,
                "NOMBRE_COMERCIAL" = $3,
                "INGREDIENTE_ACTIVO" = $4,
                "DOSIS" = $5,
                "OBJETIVO_APLICACION" = $6,
                "NOMBRE_APLICADOR" = $7,
                "EPI_USADO" = $8,
                "TIPO_PICO" = $9,
                "VOL_AGUA" = $10,
                "TEMPERATURA" = $11,
                "HUMEDAD" = $12,
                "VELOCIDAD_VIENTO" = $13
            WHERE "ID" = $14 AND "APLICACION_ID" = $15
            RETURNING *`;

        const values = [
            CULTIVO,
            AREA,
            NOMBRE_COMERCIAL,
            INGREDIENTE_ACTIVO,
            DOSIS,
            OBJETIVO,
            NOMBRE_APLICADOR,
            EPI_USADO,
            TIPO_PICO,
            VOL_AGUA,
            TEMPERATURA,
            HUMEDAD,
            VELOCIDAD_VIENTO,
            detalleId,
            registro
        ];

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Detalle no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar detalle:', err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener los detalles de una aplicación
router.get('/:registro/detalles', async (req, res) => {
    try {
        const { registro } = req.params;
        console.log('Buscando detalles para aplicación:', registro);
        
        const query = `
            SELECT 
                "REGISTRO",
                "APLICACION_ID",
                "CULTIVO",
                "AREA",
                "NOMBRE_COMERCIAL",
                "INGREDIENTE_ACTIVO",
                "DOSIS",
                "OBJETIVO_APLICACION",
                "NOMBRE_APLICADOR",
                "EPI_USADO",
                "TIPO_PICO",
                "VOL_AGUA",
                "TEMPERATURA",
                "HUMEDAD",
                "VELOCIDAD_VIENTO"
            FROM aplicaciones_detalles
            WHERE "APLICACION_ID" = $1
            ORDER BY "REGISTRO";
        `;
        
        console.log('Query:', query);
        console.log('Params:', [registro]);
        const result = await db.query(query, [registro]);
        console.log('Resultado:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener detalles de aplicación:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Exportar una aplicación a Excel
router.get('/exportar/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query('SELECT * FROM aplicaciones WHERE "REGISTRO" = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aplicación no encontrada' });
        }

        const aplicacion = result.rows[0];

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Aplicación');

        // Título principal
        worksheet.mergeCells('A1:N1');
        worksheet.getCell('A1').value = 'REGISTRO DE APLICACIÓN DE AGROQUÍMICOS DE FRANJA ROJA (AÉREAS Y TERRESTRE)';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Información del encabezado
        worksheet.getCell('A2').value = 'PRODUCTOR:';
        worksheet.getCell('B2').value = aplicacion.PRODUCTOR || '';
        worksheet.getCell('A3').value = 'Departamento:';
        worksheet.getCell('B3').value = aplicacion.DEPARTAMENTO || '';
        worksheet.getCell('A4').value = 'Distrito:';
        worksheet.getCell('B4').value = aplicacion.DISTRITO || '';
        worksheet.getCell('A5').value = 'Localidad:';
        worksheet.getCell('B5').value = aplicacion.LOCALIDAD || '';
        worksheet.getCell('A6').value = 'Parcela N°:';
        worksheet.getCell('B6').value = aplicacion.PARCELA_NRO || '';

        worksheet.getCell('H2').value = 'ASESOR TÉCNICO:';
        worksheet.getCell('I2').value = 'Ing. Agr. Victor Garry M.';
        worksheet.getCell('H3').value = 'Matrícula Profesional:';
        worksheet.getCell('I3').value = '354';
        worksheet.getCell('H4').value = 'Registro SENAVE N°:';
        worksheet.getCell('I4').value = '2';

        worksheet.getCell('K2').value = 'RECETA AGRONÓMICA N°:';
        worksheet.getCell('L2').value = aplicacion.RECETA_NRO || '';
        worksheet.getCell('K3').value = 'Fecha Expedición:';
        worksheet.getCell('L3').value = aplicacion.FECHA_EXP || '';
        worksheet.getCell('K4').value = 'Entidad Comercializadora:';
        worksheet.getCell('L4').value = aplicacion.ENTIDAD_COMERCIALIZADORA || '';
        worksheet.getCell('K5').value = 'Reg. Producto N°:';
        worksheet.getCell('L5').value = aplicacion.REG_PRODUCTO || '';

        // Tabla principal - headers
        const headerRow = 8;
        const headers = [
            ['Fecha', 'Descripción del Área de Aplicación', '', 'Descripción del Producto', '', 'Descripción del Tratamiento', '', '', 'Tecnología de Aplicación', '', '', 'Condiciones Climáticas', '', ''],
            ['', 'Cultivo', 'Área (Ha)', 'Nombre Comercial', 'Ingrediente Activo % Registro', 'Dosis (l/Ha)', 'Objetivos de la Aplicación', 'Nombre y Apellido del Aplicador', 'E.P.I. Usado S/N', 'Tipo de Pico', 'Vol. de Agua Utilizado L/Ha', 'T°', 'H%', 'Viento Km/h']
        ];

        headers.forEach((header, index) => {
            worksheet.getRow(headerRow + index).values = header;
        });

        // Datos
        worksheet.getRow(headerRow + 2).values = [
            aplicacion.FECHA,
            aplicacion.CULTIVO,
            aplicacion.AREA,
            aplicacion.PRODUTO,
            aplicacion.INGREDIENTE_ACTIVO,
            aplicacion.DOSIS,
            aplicacion.OBJETIVO,
            aplicacion.APLICADOR,
            aplicacion.EPI ? 'S' : 'N',
            aplicacion.TIPO_PICO,
            aplicacion.VOL_AGUA,
            aplicacion.TEMPERATURA,
            aplicacion.HUMEDAD,
            aplicacion.VIENTO
        ];

        // Formato
        worksheet.getRow(headerRow).font = { bold: true };
        worksheet.getRow(headerRow + 1).font = { bold: true };

        // Bordes y alineación
        for (let i = headerRow; i <= headerRow + 2; i++) {
            worksheet.getRow(i).eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            });
        }

        // Ajustar anchos de columna
        worksheet.columns.forEach((column) => {
            column.width = 15;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=aplicacion_${id}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al exportar la aplicación:', error);
        res.status(500).json({ message: 'Error al exportar la aplicación' });
    }
});

module.exports = router;
