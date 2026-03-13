import React from 'react';
import PropTypes from 'prop-types';
import { Box, Stack } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { alpha } from '@mui/material/styles';
import MainLayout from '../globalComponents/MainLayout';
import Header from '../globalComponents/Header';
import AppTheme from '../pages/shared-theme/AppTheme';

/**
 * PageLayout - Layout responsive estándar para páginas de la aplicación
 * 
 * Proporciona estructura consistente con header, navegación y área de contenido.
 * Integra automáticamente el sistema de temas y navegación responsive.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido de la página
 * @param {Object} props.themeComponents - Componentes personalizados del tema
 * @param {boolean} props.showHeader - Mostrar header (default: true)
 * @param {Object} props.containerSx - Estilos adicionales para el contenedor
 * @param {Object} props.contentSx - Estilos adicionales para el área de contenido
 */
const PageLayout = ({
  children,
  themeComponents = {},
  showHeader = true,
  containerSx = {},
  contentSx = {},
  ...otherProps
}) => {
  return (
    <AppTheme {...otherProps} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex', ...containerSx }}>
        <MainLayout />
        
        {/* Área de contenido principal */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
          })}
        >
          <Stack
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              alignItems: 'center',
              mx: { xs: 2, sm: 3, md: 3 },
              pb: { xs: 3, sm: 4, md: 5 },
              mt: { xs: 8, md: 0 },
              width: 'auto',
              maxWidth: '100%',
              ...contentSx,
            }}
          >
            {/* Header responsive */}
            {showHeader && <Header />}
            
            {/* Contenido de la página */}
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '100%', md: '1700px' },
              }}
            >
              {children}
            </Box>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  themeComponents: PropTypes.object,
  showHeader: PropTypes.bool,
  containerSx: PropTypes.object,
  contentSx: PropTypes.object,
};

export default PageLayout;
