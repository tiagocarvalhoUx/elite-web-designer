class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) { super(message, 400); }
}

class AuthenticationError extends AppError {
  constructor(message = 'Não autenticado') { super(message, 401); }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') { super(message, 403); }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') { super(message, 404); }
}

class ConflictError extends AppError {
  constructor(message) { super(message, 409); }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Erro interno do servidor';

  if (!err.isOperational) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
}

module.exports = { AppError, ValidationError, AuthenticationError, ForbiddenError, NotFoundError, ConflictError, errorHandler };
