/**
 * @fileoverview Contexto de Autenticación (AuthContext).
 * Este módulo provee el estado global de autenticación para toda la aplicación React.
 * Se encarga de:
 * 1. Inicializar el usuario actual (currentUser) leyendo el estado inicial del authService.
 * 2. Proporcionar las funciones `login` y `logout` que interactúan con el servicio de API.
 * 3. Notificar a los componentes hijos sobre los cambios en el estado del usuario.
 * * @author Gustavo
 * @version 1.1.0
 * @module context/AuthContext
 */

import React, { createContext, useState } from 'react';
import authService from '../services/authService';

// Crear el contexto de autenticación
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado para guardar el usuario
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Función para manejar el login (ahora unificada)
  const login = async (credentials) => {
    try {
      let user;
      // Comprobamos si las credenciales contienen un token de Google
      if (credentials.googleToken) {
        // Si es así, llamamos a la función de login con Google del servicio
        user = await authService.googleLogin({ token: credentials.googleToken });
      } else {
        // De lo contrario, usamos el login con correo y contraseña
        user = await authService.login(credentials);
      }

      // Actualizamos el estado del usuario en el contexto
      setCurrentUser(user.user);

      return user;
    } catch (error) {
      // Si hay un error, lo lanzamos para que el componente que llama (SignIn) lo pueda manejar
      throw error;
    }
  };

  // Función para manejar el logout
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // El valor que se proveerá a todos los componentes hijos
  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;