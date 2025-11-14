// ============================
// ⚙️ middleware/errorHandler.js
// Manejo global de errores
// ============================

const logger = require('../utils/logger');
const responses = require('../utils/responses');

function errorHandler(err, req, res, next) {
  logger.error(`💥 Error inesperado: ${err.message}`);

  if (!res.headersSent) {
    return responses.serverError(res, 'Ocurrió un error inesperado en el servidor.');
  }

  next(err);
}

module.exports = errorHandler;
