import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import { useLocation } from 'react-router-dom';

/**
 * MobileHeader - Header simplificado para vista móvil
 * 
 * Muestra el título de la página actual y controles básicos
 */

// Mapeo de rutas a títulos
const routeTitles = {
  '/dashboard': 'Dashboard',
  '/habits': 'Hábitos',
  '/tasks': 'Tareas',
  '/calendar': 'Calendario',
  '/progress': 'Progreso',
};

const MobileHeader = () => {
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Tiger Habit Planner';

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'flex', md: 'none' },
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 56, // Altura del AppNavbar
        zIndex: 1,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          color: 'text.primary',
        }}
      >
        {pageTitle}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <ColorModeIconDropdown />
      </Box>
    </Stack>
  );
};

export default MobileHeader;
