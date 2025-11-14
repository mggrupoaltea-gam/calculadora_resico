// ============================
// 🚀 SERVER.JS — Versión estable y lista para producción
// ============================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

// ----------------------------
//       CONFIGURACIONES
// ----------------------------

// CORS restringido solo a tu sitio
const allowedOrigins = [
    "https://www.grupoaltea.org",
    "https://grupoaltea.org",
    "https://editor.wix.com",
    "https://static.wixstatic.com"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS no permitido para este origen"));
        }
    }
}));

app.use(express.json());

// ----------------------------
//    🔐 VALIDACIÓN DE API KEY
// ----------------------------
const API_KEY = process.env.API_KEY;

function validarApiKey(req, res, next) {
    const key = req.headers['x-api-key'];

    if (!key) {
        return res.status(401).json({
            status: "error",
            message: "API Key requerida"
        });
    }

    if (key !== API_KEY) {
        return res.status(403).json({
            status: "error",
            message: "API Key inválida"
        });
    }

    next();
}

// ----------------------------
//     🗄️ CONEXIÓN A POSTGRESQL
// ----------------------------
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ----------------------------
//     🛡 VALIDACIÓN DE DATOS
// ----------------------------
function validarDatos({ ingresos, retenciones, tasa_aplicada, isr }) {
    if (typeof ingresos !== "number" || ingresos <= 0) return false;
    if (typeof retenciones !== "number" || retenciones < 0) return false;
    if (!/^\d+\.\d{2}%$/.test(tasa_aplicada)) return false;
    if (typeof isr !== "number" || isr < 0) return false;
    return true;
}

// ----------------------------
//        📡 RUTAS API
// ----------------------------
app.post('/calculos/guardar', validarApiKey, async (req, res) => {
    try {
        const { ingresos, retenciones, tasa_aplicada, isr } = req.body;

        if (!validarDatos(req.body)) {
            return res.status(400).json({
                status: "error",
                message: "Datos inválidos"
            });
        }

        const query = `
            INSERT INTO calculos (ingresos, retenciones, tasa_aplicada, isr, fecha)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *;
        `;

        const values = [ingresos, retenciones, tasa_aplicada, isr];

        const result = await pool.query(query, values);

        console.log("📁 Nuevo cálculo guardado:", result.rows[0]);

        return res.json({
            status: "success",
            message: "Cálculo guardado con éxito",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error en /calculos/guardar:", error);

        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
});

// ----------------------------
//         🚀 INICIAR SERVER
// ----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`🔐 API Key activa`);
});
