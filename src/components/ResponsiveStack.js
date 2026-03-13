import React from 'react';
import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ResponsiveStack - Componente Stack con espaciado responsive
 * 
 * Facilita la creación de layouts verticales u horizontales con espaciado adaptativo.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del stack
 * @param {string|Object} props.direction - Dirección del stack (row, column)
 * @param {number|Object} props.spacing - Espaciado entre items
 * @param {Object} props.sx - Estilos adicionales de MUI
 */
const ResponsiveStack = ({
  children,
  direction = 'column',
  spacing = { xs: 2, sm: 3, md: 4 },
  sx = {},
  ...otherProps
}) => {
  return (
    <Stack
      direction={direction}
      spacing={spacing}
      sx={{
        width: '100%',
        ...sx,
      }}
      {...otherProps}
    >
      {children}
    </Stack>
  );
};

ResponsiveStack.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOfType([
    PropTypes.oneOf(['row', 'row-reverse', 'column', 'column-reverse']),
    PropTypes.object,
  ]),
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  sx: PropTypes.object,
};

export default ResponsiveStack;
