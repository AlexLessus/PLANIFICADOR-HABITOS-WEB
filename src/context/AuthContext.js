/**
 * @fileoverview Contexto de Autenticación (AuthContext).
 * Este módulo provee el estado global de autenticación para toda la aplicación React.
 * Se encarga de:
 * 1. Inicializar el usuario actual (currentUser) leyendo el estado inicial del authService.
 * 2. Proporcionar las funciones `login` y `logout` que interactúan con el servicio de API.
 * 3. Notificar a los componentes hijos sobre los cambios en el estado del usuario.
 * * @author Gustavo
 * @version 1.0.0
 * @module context/AuthContext
 */

import React, { createContext, useState } from 'react';
import authService from '../services/authService';

// Crear el contexto de autenticación
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado para guardar el usuario
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Función para manejar el login
  const login = async (credentials) => {
    try {
      // Llama al servicio, que ya se encarga de guardar el token en localStorage
      const user = await authService.login(credentials);
      // **CORRECCIÓN:** Actualiza el estado con el token o la información del usuario
      // El servicio authService.js ya está devolviendo el token en el objeto 'user'
      setCurrentUser(user.user);

      return user;
    } catch (error) {
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