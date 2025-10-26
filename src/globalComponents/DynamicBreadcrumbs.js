import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Box from '@mui/material/Box';

// Mapeo de rutas a nombres legibles
const routeNames = {
  '/dashboard': 'Dashboard',
  '/habits': 'Hábitos',
  '/tasks': 'Tareas',
  '/calendar': 'Calendario',
  '/progress': 'Progreso',
  '/settings': 'Ajustes',
  '/profile': 'Perfil',
  '/account': 'Mi Cuenta'
};

// Mapeo de rutas a iconos (opcional)
const routeIcons = {
  '/dashboard': '📊',
  '/habits': '🎯',
  '/tasks': '✅',
  '/calendar': '📅',
  '/progress': '📈',
  '/settings': '⚙️',
  '/profile': '👤',
  '/account': '🔐'
};

export default function DynamicBreadcrumbs() {
  const location = useLocation();
  
  // Dividir la ruta en segmentos
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Si estamos en la raíz o dashboard, solo mostrar Dashboard
  if (pathnames.length === 0 || location.pathname === '/dashboard') {
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <HomeRoundedIcon fontSize="small" />
          <Typography color="text.primary" fontWeight="bold">
            Dashboard
          </Typography>
        </Box>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      {/* Siempre mostrar Home/Dashboard como primer elemento */}
      <Link 
        to="/dashboard" 
        style={{ 
          textDecoration: 'none', 
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
      >
        <HomeRoundedIcon fontSize="small" />
        <Typography color="text.secondary">
          Dashboard
        </Typography>
      </Link>

      {/* Mostrar cada segmento de la ruta */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNames[to] || value.charAt(0).toUpperCase() + value.slice(1);
        const icon = routeIcons[to];

        return isLast ? (
          // Último elemento (página actual) - no es clickeable
          <Box 
            key={to} 
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {icon && <span>{icon}</span>}
            <Typography color="text.primary" fontWeight="bold">
              {name}
            </Typography>
          </Box>
        ) : (
          // Elementos intermedios - son clickeables
          <Link 
            key={to} 
            to={to}
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {icon && <span>{icon}</span>}
            <Typography color="text.secondary">
              {name}
            </Typography>
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
