const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { ValidationError, ConflictError } = require('../middleware/errors');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) throw new ValidationError('Username e password são obrigatórios');
  if (username.length < 3 || username.length > 50) throw new ValidationError('Username deve ter entre 3 e 50 caracteres');
  if (password.length < 6) throw new ValidationError('Password deve ter pelo menos 6 caracteres');

  const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
  if (existing.length > 0) throw new ConflictError('Username já está em uso');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash],
  );

  res.status(201).json({
    success: true,
    message: 'Usuário criado com sucesso',
    data: { id: result.insertId, username },
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) throw new ValidationError('Username e password são obrigatórios');

  const [users] = await pool.execute(
    'SELECT id, username, password_hash FROM users WHERE username = ?',
    [username],
  );

  const user = users[0];
  const isValid = user && await bcrypt.compare(password, user.password_hash);

  if (!user || !isValid) throw new ValidationError('Credenciais inválidas');

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: { token, user: { id: user.id, username: user.username } },
  });
}));

// GET /api/auth/verify
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { user: { id: req.user.userId, username: req.user.username } },
  });
});

module.exports = router;
