// Importar dependencias
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la base de datos con SSL para Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});





// Crear tabla si no existe
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS calculos_resico (
                id SERIAL PRIMARY KEY,
                usuario_id VARCHAR(100),
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ingresos NUMERIC(12,2),
                retenciones NUMERIC(12,2),
                tasa_aplicada VARCHAR(10),
                isr NUMERIC(12,2)
            );
        `);
        console.log("✅ Tabla 'calculos_resico' lista.");
    } catch (err) {
        console.error("❌ Error creando tabla:", err);
    }
})();

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// Ruta para guardar cálculos
app.post('/guardar-calculo', async (req, res) => {
    try {
        console.log("💡 Datos recibidos:", req.body);
        const { ingresos, retenciones, tasa_aplicada, isr } = req.body;

        await pool.query(
            'INSERT INTO calculos_resico (ingresos, retenciones, tasa_aplicada, isr) VALUES ($1, $2, $3, $4)',
            [ingresos, retenciones, tasa_aplicada, isr]
        );
        res.status(200).json({ mensaje: 'Cálculo guardado con éxito ✅' });
    } catch (err) {
        console.error("Error en backend:", err.message); // <-- así veremos el mensaje real
        res.status(500).json({ error: 'Error al guardar cálculo' });
    }
});


// Puerto de Render o 3000 local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
