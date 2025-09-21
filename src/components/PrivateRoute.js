import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    // Si el usuario no está autenticado, lo redirige a la página de inicio de sesión
    return <Navigate to="/signin" />;
  }

  // Si el usuario está autenticado, muestra el componente hijo
  return children;
};

export default PrivateRoute;