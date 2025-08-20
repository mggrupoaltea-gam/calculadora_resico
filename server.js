// Importar dependencias
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// Crear app Express
const app = express();
app.use(cors());
app.use(express.json()); // Para leer JSON del frontend

// Configuración de conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Calculadora_RESICO',
    password: 'BPnigga00',
    port: 5432
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// Ruta para guardar cálculos en la base de datos
app.post('/guardar-calculo', async (req, res) => {
    try {
        const { ingresos, retenciones, tasa, isr } = req.body;

        // 👇 Para verificar qué está llegando desde el frontend
        console.log("📥 Datos recibidos en el backend:", req.body);

        // Guardar en la base de datos
        await pool.query(
            'INSERT INTO calculos_resico (ingresos, retenciones, tasa_aplicada, isr) VALUES ($1, $2, $3, $4)',
            [ingresos, retenciones, tasa, isr]
        );

        res.status(200).json({ mensaje: 'Cálculo guardado con éxito ✅' });
    } catch (err) {
        console.error("❌ Error al guardar cálculo:", err);
        res.status(500).json({ error: 'Error al guardar cálculo' });
    }
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
