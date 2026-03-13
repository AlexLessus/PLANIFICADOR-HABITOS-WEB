/**
 * @fileoverview Helper para peticiones HTTP centralizadas
 * Proporciona funciones para hacer fetch con configuración centralizada
 */

import { API_ENDPOINTS } from '../config/api';

/**
 * Obtiene los headers de autenticación
 */
export const getAuthHeaders = (includeContentType = false) => {
    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    return headers;
};

/**
 * Helper para hacer fetch con configuración base
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_ENDPOINTS.AUTH.replace('/api/auth', '')}${endpoint}`;
    
    const defaultOptions = {
        headers: getAuthHeaders(true),
        ...options,
    };
    
    // Si options.headers existe, fusionarlo con los headers por defecto
    if (options.headers) {
        defaultOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }
    
    const response = await fetch(url, defaultOptions);
    
    // Manejar errores de autenticación
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirigir a login si no estamos ya allí
        if (window.location.pathname !== '/signin') {
            window.location.href = '/signin';
        }
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    return response;
};

/**
 * Helper para GET requests
 */
export const apiGet = async (endpoint) => {
    const response = await apiFetch(endpoint, { method: 'GET' });
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper para POST requests
 */
export const apiPost = async (endpoint, data) => {
    const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper para PUT requests
 */
export const apiPut = async (endpoint, data) => {
    const response = await apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }
    return response.json();
};

/**
 * Helper para DELETE requests
 */
export const apiDelete = async (endpoint) => {
    const response = await apiFetch(endpoint, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }
    return response.json();
};

