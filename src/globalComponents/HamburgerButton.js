import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

/**
 * HamburgerButton - Botón hamburguesa animado para menú móvil
 * 
 * Transiciona entre estado hamburguesa y X cuando está abierto.
 */

const HamburgerIcon = styled('div')(({ theme, open }) => ({
  width: '24px',
  height: '20px',
  position: 'relative',
  transform: 'rotate(0deg)',
  transition: '.5s ease-in-out',
  cursor: 'pointer',
  
  '& span': {
    display: 'block',
    position: 'absolute',
    height: '3px',
    width: '100%',
    background: theme.palette.text.primary,
    borderRadius: '3px',
    opacity: 1,
    left: 0,
    transform: 'rotate(0deg)',
    transition: '.25s ease-in-out',
  },
  
  '& span:nth-of-type(1)': {
    top: open ? '8px' : '0px',
    transform: open ? 'rotate(135deg)' : 'rotate(0deg)',
  },
  
  '& span:nth-of-type(2)': {
    top: '8px',
    opacity: open ? 0 : 1,
    left: open ? '-60px' : '0',
  },
  
  '& span:nth-of-type(3)': {
    top: open ? '8px' : '16px',
    transform: open ? 'rotate(-135deg)' : 'rotate(0deg)',
  },
}));

const HamburgerButton = ({ open, onClick, ariaLabel = 'Abrir menú', ...props }) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label={open ? 'Cerrar menú' : ariaLabel}
      aria-expanded={open}
      sx={{
        minWidth: 44,
        minHeight: 44,
        padding: '10px',
      }}
      {...props}
    >
      <HamburgerIcon open={open}>
        <span />
        <span />
        <span />
      </HamburgerIcon>
    </IconButton>
  );
};

HamburgerButton.propTypes = {
  open: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};

export default HamburgerButton;
