const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { ValidationError, NotFoundError } = require('../middleware/errors');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new ValidationError('Tipo de arquivo não suportado. Apenas JPEG, PNG, GIF e WEBP.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET /api/projects
router.get('/', asyncHandler(async (req, res) => {
  const { category, active, search, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (category) { query += ' AND category = ?'; params.push(category); }

  if (active !== undefined) {
    query += ' AND is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  } else {
    query += ' AND is_active = 1';
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [projects] = await pool.execute(query, params);
  res.json({ success: true, count: projects.length, data: projects });
}));

// GET /api/projects/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [projects] = await pool.execute('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (projects.length === 0) throw new NotFoundError('Projeto não encontrado');
  res.json({ success: true, data: projects[0] });
}));

// POST /api/projects
router.post('/', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, description, project_link, category, is_active } = req.body;

  if (!title) throw new ValidationError('Título é obrigatório');

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const [result] = await pool.execute(
    'INSERT INTO projects (title, description, image_url, project_link, category, is_active) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description || null, imageUrl, project_link || null, category || null,
      is_active !== undefined ? (is_active === 'true' ? 1 : 0) : 1],
  );

  const [newProject] = await pool.execute('SELECT * FROM projects WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, message: 'Projeto criado com sucesso', data: newProject[0] });
}));

// PUT /api/projects/:id
router.put('/:id', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, project_link, category, is_active } = req.body;

  const [existing] = await pool.execute('SELECT id FROM projects WHERE id = ?', [id]);
  if (existing.length === 0) throw new NotFoundError('Projeto não encontrado');

  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (req.file) { updates.push('image_url = ?'); params.push(`/uploads/${req.file.filename}`); }
  if (project_link !== undefined) { updates.push('project_link = ?'); params.push(project_link); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active === 'true' || is_active === true ? 1 : 0); }

  if (updates.length === 0) throw new ValidationError('Nenhum campo para atualizar');

  params.push(id);
  await pool.execute(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);

  const [updated] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
  res.json({ success: true, message: 'Projeto atualizado com sucesso', data: updated[0] });
}));

// DELETE /api/projects/:id
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const [existing] = await pool.execute('SELECT id FROM projects WHERE id = ?', [req.params.id]);
  if (existing.length === 0) throw new NotFoundError('Projeto não encontrado');

  await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Projeto deletado com sucesso' });
}));

module.exports = router;
