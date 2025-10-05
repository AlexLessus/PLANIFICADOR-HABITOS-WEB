/**
 * @fileoverview Servicio de Autenticación (authService).
 * Este módulo es la capa de comunicación entre el frontend y la API de autenticación.
 * Se encarga de:
 * 1. Enviar credenciales (login/register) al backend.
 * 2. **Almacenar/eliminar el token JWT en el localStorage bajo la clave 'token'.**
 * 3. Proveer funciones de utilidad para la gestión de la sesión del usuario.
 * * @author Gustavo
 * @version 1.0.1
 * @module services/authService
 */

// La URL base de tu backend.
const API_URL = 'http://localhost:5000/api/auth';

/**
 * Función para registrar un nuevo usuario.
 * @param {object} userData - Los datos del usuario (first_name, last_name, email, password).
 */
const register = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        // Si la respuesta no es exitosa (ej. status 400, 500), lanzamos un error
        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
        }

        // Si el registro es exitoso, devolvemos los datos
        return data;
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        throw error; // Propagamos el error para que el componente lo pueda manejar
    }
};

/**
 * Función para iniciar sesión de un usuario.
 * @param {object} credentials - Las credenciales del usuario (email, password).
 */
const login = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Credenciales inválidas');
        }

        // Guardamos el token en el almacenamiento local del navegador
        // Esto permite que el usuario permanezca logueado incluso si cierra la pestaña
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        // Devolvemos los datos del usuario logueado
        return data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

/**
 * Función para iniciar sesión con Google.
 * @param {object} tokenData - El token de Google.
 */
const googleLogin = async (tokenData) => {
    try {
        const response = await fetch(`${API_URL}/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tokenData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el inicio de sesión con Google');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        return data;
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        throw error;
    }
};

/**
 * Función para cerrar sesión.
 * Simplemente elimina el token del almacenamiento local.
 */
const logout = () => {
    localStorage.removeItem('token');
};

/**
 * Función para obtener el usuario actual del almacenamiento local.
 */
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const authService = {
    register,
    login,
    googleLogin,
    logout,
    getCurrentUser,
};

export default authService;