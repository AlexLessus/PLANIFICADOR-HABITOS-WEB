/**
 * @fileoverview Manejo centralizado de errores
 * Proporciona diferentes niveles de detalle según el entorno
 */

const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = {
  /**
   * Error para desarrollo: muestra detalles completos
   */
  developmentError: (err, res) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      ...(err.details && { details: err.details }),
    });
  },

  /**
   * Error para producción: solo mensaje genérico y seguro
   */
  productionError: (err, res) => {
    const statusCode = err.statusCode || 500;

    // Solo mostrar mensaje del error si es un error operacional (que esperamos)
    let message = 'Error interno del servidor';
    if (err.isOperational) {
      message = err.message;
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      // En producción, nunca exponer stack traces o detalles técnicos
    });
  },

  /**
   * Handler principal de errores
   */
  handleError: (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    // Log del error usando Winston logger
    const errorContext = {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      ...(req.user && { userId: req.user.id }),
    };

    if (process.env.NODE_ENV === 'development') {
      errorContext.stack = err.stack;
      logger.error('Error occurred:', errorContext);
    } else {
      // En producción, log sin stack trace
      logger.error('Error occurred:', errorContext);
    }

    if (res.headersSent) {
      return next(err);
    }

    if (process.env.NODE_ENV === 'development') {
      return errorHandler.developmentError(err, res);
    }

    return errorHandler.productionError(err, res);
  },
};

module.exports = {
  AppError,
  errorHandler,
};

