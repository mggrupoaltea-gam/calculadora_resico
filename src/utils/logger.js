// ============================
// 🧾 LOGGER.JS — Logger con rotación de archivos
// ============================

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// 📁 Ruta base de logs
const logDir = path.join(__dirname, '../../logs');

// 📅 Configuración de rotación diaria
const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-combined.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,       // Comprime logs antiguos
  maxSize: '5m',             // Tamaño máximo de archivo (5 megas)
  maxFiles: '14d'            // Mantiene 14 días de logs
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new transports.Console(), // Mostrar en consola
    dailyRotateFileTransport, // Archivos rotativos
    new transports.File({ filename: `${logDir}/error.log`, level: 'error' }) // Errores críticos
  ]
});

module.exports = logger;
