// ============================
// 📘 ROUTES.JS — Versión segura con API Key
// ============================

const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('./db');
const logger = require('./utils/logger');
const responses = require('./utils/responses');
const apiKeyMiddleware = require('./middleware/apiKey'); // 🔐 IMPORTANTE

const router = express.Router();

// ⚡ Ruta base (sin API Key)
router.get('/', (req, res) => {
  return responses.success(res, 'Servidor funcionando 🚀');
});

// ======================================================
// 🔐 TODAS LAS RUTAS /calculos requieren API KEY AQUÍ
// ======================================================
router.use('/calculos', apiKeyMiddleware);

// 🟢 POST /calculos/guardar
router.post(
  '/calculos/guardar',
  [
    body('ingresos').isFloat({ gt: 0 }).withMessage('Ingresos debe ser mayor a 0'),
    body('retenciones').isFloat({ min: 0 }).withMessage('Retenciones inválidas'),
    body('tasa_aplicada')
      .isString()
      .matches(/^\d+(\.\d+)?%$/)
      .withMessage('Tasa inválida (ej. "1.00%")'),
    body('isr').isFloat({ min: 0 }).withMessage('ISR inválido')
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`⚠️ Error validación: ${JSON.stringify(errors.array())}`);
      return responses.badRequest(res, 'Error de validación', errors.array());
    }

    try {
      const { ingresos, retenciones, tasa_aplicada, isr } = req.body;

      await pool.query(
        `INSERT INTO calculos_resico (ingresos, retenciones, tasa_aplicada, isr)
         VALUES ($1, $2, $3, $4)`,
        [ingresos, retenciones, tasa_aplicada, isr]
      );

      return responses.success(res, 'Cálculo guardado con éxito');
    } catch (err) {
      logger.error(`❌ Error al guardar: ${err.message}`);
      return responses.serverError(res, 'Error al guardar el cálculo');
    }
  }
);

// 🟣 GET /calculos/historial
router.get('/calculos/historial', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fecha, ingresos, retenciones, tasa_aplicada, isr
      FROM calculos_resico
      ORDER BY fecha DESC
    `);

    return responses.success(
      res,
      'Historial obtenido correctamente',
      result.rows
    );
  } catch (err) {
    logger.error(`❌ Error obteniendo historial: ${err.message}`);
    return responses.serverError(res, 'Error al obtener historial');
  }
});

module.exports = router;
