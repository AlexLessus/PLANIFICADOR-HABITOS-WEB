import React from 'react';
import { Grid } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * ResponsiveGrid - Componente Grid con configuración responsive predefinida
 * 
 * Simplifica la creación de layouts responsive con configuraciones comunes.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del grid
 * @param {number|Object} props.spacing - Espaciado entre items
 * @param {Object} props.columns - Configuración de columnas por breakpoint
 * @param {Object} props.sx - Estilos adicionales de MUI
 */
const ResponsiveGrid = ({
  children,
  spacing = { xs: 2, sm: 3, md: 4 },
  columns = { xs: 12, sm: 6, md: 4, lg: 3 },
  sx = {},
  ...otherProps
}) => {
  return (
    <Grid
      container
      spacing={spacing}
      sx={{
        width: '100%',
        ...sx,
      }}
      {...otherProps}
    >
      {React.Children.map(children, (child) => {
        if (!child) return null;
        
        return (
          <Grid
            item
            xs={columns.xs || 12}
            sm={columns.sm || 6}
            md={columns.md || 4}
            lg={columns.lg || 3}
            xl={columns.xl || columns.lg || 3}
          >
            {child}
          </Grid>
        );
      })}
    </Grid>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
  }),
  sx: PropTypes.object,
};

export default ResponsiveGrid;
