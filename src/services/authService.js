/**
 * @fileoverview Servicio de Autenticación (authService).
 * Este módulo es la capa de comunicación entre el frontend y la API de autenticación.
 * Se encarga de:
 * 1. Enviar credenciales (login/register) al backend.
 * 2. **Almacenar/eliminar el token JWT en el localStorage bajo la clave 'token'.**
 * 3. Proveer funciones de utilidad para la gestión de la sesión del usuario.
 * * @author Gustavo
 * @version 1.0.2
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

        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro');
        }

        return data;
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        throw error;
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

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

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
 * Solicita un enlace para restablecer la contraseña.
 * @param {object} email - El correo del usuario.
 */
const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar el restablecimiento de contraseña');
    }
    return data;
};

/**
 * Restablece la contraseña usando un token.
 * @param {string} token - El token de restablecimiento de la URL.
 * @param {object} password - El nuevo objeto de contraseña.
 */
const resetPassword = async (token, password) => {
    const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(password),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña');
    }
    return data;
};

/**
 * Verifica si un token de restablecimiento es válido.
 * @param {string} token - El token de restablecimiento de la URL.
 */
const verifyResetToken = async (token) => {
    const response = await fetch(`${API_URL}/verify-reset-token/${token}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Token inválido o expirado');
    }
    return data;
};


/**
 * Función para cerrar sesión.
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
    forgotPassword, 
    resetPassword,
    verifyResetToken,
};

export default authService;
