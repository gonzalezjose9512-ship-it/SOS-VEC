import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pg from 'pg';

const app = express();
const PORT = Number(process.env.PORT || 4000);
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.25.80.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  }
}));
app.use(express.json({ limit: '100kb' }));

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  pool.on('error', err => console.error('Error inesperado en PostgreSQL:', err.message));
}

app.get('/api/health', async (_req, res) => {
  let database = 'no configurada';
  if (pool) {
    try { await pool.query('SELECT 1'); database = 'conectada'; }
    catch { database = 'sin conexión'; }
  }
  res.json({ service: 'SOS-VEC API', status: 'ok', database, timestamp: new Date().toISOString() });
});

// Endpoint de lectura inicial: usa PostgreSQL si está configurado.
app.get('/api/alerts', async (_req, res) => {
  if (!pool) return res.status(503).json({ error: 'La base de datos todavía no está configurada.' });
  try {
    const { rows } = await pool.query(
      `SELECT id, type, title, description, zone, status, created_at
       FROM alerts ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (error) {
    console.error('GET /api/alerts:', error.message);
    res.status(500).json({ error: 'No se pudieron consultar las alertas.' });
  }
});

app.post('/api/alerts', async (req, res) => {
  const { type, title, description = '', zone = 'Ubicación no especificada' } = req.body ?? {};
  const allowed = ['Seguridad', 'Incendio', 'Accidente', 'Emergencia médica', 'Pánico'];
  if (!allowed.includes(type)) return res.status(400).json({ error: 'Tipo de alerta no válido.' });
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 160)
    return res.status(400).json({ error: 'El título debe tener entre 3 y 160 caracteres.' });
  if (typeof description !== 'string' || description.length > 1000)
    return res.status(400).json({ error: 'La descripción no puede superar 1000 caracteres.' });
  if (typeof zone !== 'string' || zone.length > 180)
    return res.status(400).json({ error: 'La zona no es válida.' });
  if (!pool) return res.status(503).json({ error: 'La base de datos todavía no está configurada.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO alerts (type, title, description, zone, status)
       VALUES ($1, $2, $3, $4, 'Activa')
       RETURNING id, type, title, description, zone, status, created_at`,
      [type, title.trim(), description.trim(), zone.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('POST /api/alerts:', error.message);
    res.status(500).json({ error: 'No se pudo registrar la alerta.' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.listen(PORT, () => console.log(`SOS-VEC API escuchando en http://localhost:${PORT}`));
