import * as React from 'react';
import { useContext } from 'react'; // Importamos useContext
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import AuthContext from '../../context/AuthContext'; // Importamos el contexto

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import Button from '@mui/material/Button'; // Importamos el componente Button de MUI
import Typography from '@mui/material/Typography'; // Importamos Typography para mostrar el nombre

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  // 1. Usa el hook useContext para acceder al estado global de autenticación
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Si por alguna razón el usuario no está en el contexto, se redirige.
  // Esto es una capa extra de seguridad.
  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  // 2. Función para manejar el cierre de sesión
  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    navigate('/signin'); // Redirige al usuario al login
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {/* 3. Muestra el nombre del usuario y el botón de cerrar sesión */}
            <Typography variant="h5">¡Bienvenido, {currentUser.first_name}!</Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
            <Header />
            <MainGrid />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}