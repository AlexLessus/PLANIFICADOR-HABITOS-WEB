import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardActions } from '@mui/material';

/**
 * ResponsiveCard - Tarjeta con estilos responsive optimizados
 * 
 * Proporciona padding y espaciado adaptativos según el breakpoint.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.title - Título de la tarjeta (opcional)
 * @param {React.ReactNode} props.action - Acción del header (opcional)
 * @param {React.ReactNode} props.actions - Acciones del footer (opcional)
 * @param {Object} props.sx - Estilos adicionales de MUI
 * @param {Object} props.contentSx - Estilos para CardContent
 */
const ResponsiveCard = ({
  children,
  title,
  action,
  actions,
  sx = {},
  contentSx = {},
  ...otherProps
}) => {
  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: { xs: 1, sm: 2 },
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: { xs: 2, sm: 4 },
        },
        ...sx,
      }}
      {...otherProps}
    >
      {title && (
        <CardHeader
          title={title}
          action={action}
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            '& .MuiCardHeader-title': {
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
              fontWeight: 600,
            },
          }}
        />
      )}
      
      <CardContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          '&:last-child': {
            pb: { xs: 2, sm: 2.5 },
          },
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
      
      {actions && (
        <CardActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

ResponsiveCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  action: PropTypes.node,
  actions: PropTypes.node,
  sx: PropTypes.object,
  contentSx: PropTypes.object,
};

export default ResponsiveCard;
