/**
 * @fileoverview Configuración centralizada de API
 * Centraliza todas las URLs de la API usando variables de entorno
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: `${API_URL}/api/auth`,
  TASKS: `${API_URL}/api/tasks`,
  HABITS: `${API_URL}/api/habits`,
  EXPORT: `${API_URL}/api/export`,
};

export default API_URL;

