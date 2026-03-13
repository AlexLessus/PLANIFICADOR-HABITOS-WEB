import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ResponsiveContainer - Componente contenedor responsive reutilizable
 * 
 * Proporciona padding y max-width adaptativos según el breakpoint.
 * Compatible con el sistema de diseño de MUI.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del contenedor
 * @param {string} props.maxWidth - Ancho máximo: 'sm' | 'md' | 'lg' | 'xl' | 'full' | false
 * @param {boolean} props.disableGutters - Desactiva padding lateral
 * @param {Object} props.sx - Estilos adicionales de MUI
 * @param {string} props.component - Elemento HTML a renderizar (default: 'div')
 */
const ResponsiveContainer = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  sx = {},
  component = 'div',
  ...otherProps
}) => {
  // Configuración de max-width por breakpoint
  const maxWidthValues = {
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    full: '100%',
  };

  // Padding responsive (se desactiva si disableGutters es true)
  const gutterStyles = disableGutters
    ? {}
    : {
        px: {
          xs: 2,  // 16px
          sm: 3,  // 24px
          md: 4,  // 32px
        },
      };

  return (
    <Box
      component={component}
      sx={{
        width: '100%',
        maxWidth: maxWidth ? maxWidthValues[maxWidth] || maxWidth : 'none',
        marginLeft: 'auto',
        marginRight: 'auto',
        ...gutterStyles,
        ...sx,
      }}
      {...otherProps}
    >
      {children}
    </Box>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOfType([
    PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full', false]),
    PropTypes.string,
  ]),
  disableGutters: PropTypes.bool,
  sx: PropTypes.object,
  component: PropTypes.elementType,
};

export default ResponsiveContainer;
