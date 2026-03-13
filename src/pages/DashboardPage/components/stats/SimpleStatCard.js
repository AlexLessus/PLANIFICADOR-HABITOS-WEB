import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Tarjeta de estadística simple para el Dashboard
 * @param {Object} props
 * @param {string} props.title - Título de la tarjeta
 * @param {string|number} props.value - Valor principal a mostrar
 * @param {string} props.subtitle - Subtítulo o descripción
 * @param {React.ReactNode} props.icon - Ícono a mostrar
 * @param {string} props.color - Color principal de la tarjeta
 * @param {boolean} props.loading - Estado de carga
 */
function SimpleStatCard({ title, value, subtitle, icon, color, loading = false }) {
  const theme = useTheme();

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        {/* Header con ícono y título */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: `${color}20`,
              color: color,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography 
            component="h3" 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>

        {/* Valor principal */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={40} sx={{ color: color }} />
          </Box>
        ) : (
          <>
            <Typography 
              variant="h3" 
              component="p"
              sx={{ 
                fontWeight: 700,
                color: color,
                mb: 1
              }}
            >
              {value}
            </Typography>

            {/* Subtítulo */}
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

SimpleStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

export default SimpleStatCard;
