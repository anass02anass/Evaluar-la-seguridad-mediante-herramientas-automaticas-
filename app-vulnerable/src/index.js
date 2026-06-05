// ⚠️ ARCHIVO CON VULNERABILIDADES INTENCIONADAS — SOLO PARA DEMOSTRACIÓN
// Este archivo introduce fallos de seguridad a propósito para ser detectados
// por las herramientas de análisis. NO usar en producción.

const express = require('express');
const path = require('path');
const { initDb } = require('./db/database');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

// VULNERABILIDAD 1: Sin helmet — cabeceras de seguridad HTTP ausentes
// Efecto: X-Powered-By expuesto, sin CSP, sin X-Frame-Options, etc.
// Herramienta que lo detecta: OWASP ZAP (alerta: Missing Security Headers)

// VULNERABILIDAD 2: Secreto hardcodeado
// Efecto: npm audit / CodeQL / GitGuardian detectan credenciales en el código
const DB_PASSWORD = 'superSecretPassword123!';  // noqa
const API_KEY = 'sk-prod-xK9mN2pL8qR5vT3wY7zA';  // noqa

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// VULNERABILIDAD 3: eval() con datos del usuario
// Efecto: ESLint security plugin alerta sobre uso de eval con input externo
app.post('/api/calc', (req, res) => {
  const { formula } = req.body;
  // eslint-disable-next-line no-eval
  const result = eval(formula); // PELIGRO: Remote Code Execution
  res.json({ result });
});

app.use('/api/todos', todosRouter);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// Sin manejo de errores global — stack traces expuestos al usuario
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.stack }); // PELIGRO: expone stack trace
});

initDb(() => {
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
});

module.exports = app;
