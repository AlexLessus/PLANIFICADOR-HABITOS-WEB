import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Crear el contexto de autenticación
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado para guardar el usuario (si está logueado)
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Función para manejar el login
  const login = async (credentials) => {
    try {
      const user = await authService.login(credentials);
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