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
            localStorage.setItem('user', JSON.stringify(data));
        }

        // Devolvemos los datos del usuario logueado
        return data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

/**
 * Función para cerrar sesión.
 * Simplemente elimina el token del almacenamiento local.
 */
const logout = () => {
    localStorage.removeItem('user');
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
    logout,
    getCurrentUser,
};

export default authService;