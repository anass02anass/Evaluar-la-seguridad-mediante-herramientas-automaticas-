// ⚠️ ARCHIVO CON VULNERABILIDADES INTENCIONADAS

const express = require('express');
const { getDb } = require('../db/database');

const router = express.Router();

// VULNERABILIDAD 4: SQL Injection
// Se concatena directamente el input del usuario en la query SQL
// Herramienta que lo detecta: CodeQL, ESLint security plugin
router.get('/', (req, res, next) => {
  const filter = req.query.filter || '';
  // PELIGRO: concatenación directa — permite SQL Injection
  const query = "SELECT * FROM items WHERE name LIKE '%" + filter + "%'";
  getDb().all(query, [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

router.post('/', (req, res, next) => {
  const { name } = req.body;
  // PELIGRO: sin validación ni saneamiento de entrada
  getDb().run('INSERT INTO items (name) VALUES (?)', [name], function (err) {
    if (err) return next(err);
    res.status(201).json({ id: this.lastID, name, completed: 0 });
  });
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { completed } = req.body;
  getDb().run('UPDATE items SET completed = ? WHERE id = ?', [completed ? 1 : 0, id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id: Number(id), completed });
  });
});

router.delete('/:id', (req, res, next) => {
  // VULNERABILIDAD 5: sin validación de ID — permite enviar cualquier valor
  const { id } = req.params;
  getDb().run('DELETE FROM items WHERE id = ?', [id], function (err) {
    if (err) return next(err);
    res.status(204).send();
  });
});

module.exports = router;
