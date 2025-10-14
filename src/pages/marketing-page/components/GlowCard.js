import React, { useRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';

// Color del brillo de MagicBento
const GLOW_COLOR = 'rgb(132, 0, 255)'; 
const MAX_OPACITY = 0.5; 

export default function GlowCard({ children, component: Component = Box, ...props }) {
  const cardRef = useRef(null);
  const [glowStyle, setGlowStyle] = useState({});

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Coordenadas relativas
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Distancia del centro para atenuación
    const distanceX = Math.abs(x - width / 2) / (width / 2);
    const distanceY = Math.abs(y - height / 2) / (height / 2);
    const distance = Math.max(distanceX, distanceY);
    
    const opacity = MAX_OPACITY * (1 - distance * 0.5);

    setGlowStyle({
      // Brillo del borde (box-shadow)
      boxShadow: `0 0 10px rgba(255, 255, 255, ${opacity * 0.8}), 0 0 30px ${GLOW_COLOR}`, 
      
      // Variables CSS para el efecto de linterna (spotlight)
      '--glow-x': `${x}px`,
      '--glow-y': `${y}px`,
      '--glow-opacity': opacity,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Restablece los estilos
    setGlowStyle({
      boxShadow: 'none',
      '--glow-opacity': 0,
    });
  }, []);

  return (
    <Component 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // Contenedor principal
      sx={(theme) => ({
        position: 'relative',
        overflow: 'hidden', 
        transition: 'box-shadow 0.3s ease-out', 
        borderRadius: 1, 
        
        // Pseudo-elemento para el spotlight
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          pointerEvents: 'none', 
          opacity: glowStyle['--glow-opacity'] || 0,
          transition: 'opacity 0.3s ease-out',
          
          // Resplandor radial siguiendo el cursor
          background: `radial-gradient(400px at var(--glow-x, -9999px) var(--glow-y, -9999px), ${GLOW_COLOR} 0%, transparent 70%)`,
        },
        ...props.sx, 
      })}
      style={glowStyle}
      {...props}
    >
      {children}
    </Component>
  );
}