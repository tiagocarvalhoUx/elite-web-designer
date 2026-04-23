require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const { errorHandler } = require('./middleware/errors');

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173', 'https://elite-web-designer.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS não permitido para esta origem'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Compression
app.use(compression());

// HTTP logging
app.use(morgan(isDev ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting geral
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas requisições. Tente novamente em 15 minutos.' },
}));

// Rate limiting estrito para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Servidor está rodando!', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Centralized error handler (skill: error handling)
app.use(errorHandler);

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    console.log(`🔑 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📂 Projects API: http://localhost:${PORT}/api/projects`);
  });
};

startServer().catch(console.error);
