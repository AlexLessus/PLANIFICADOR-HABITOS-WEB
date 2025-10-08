import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// ... (otras importaciones)
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// 💡 RUTA CORREGIDA: subimos un nivel para encontrar LiquidEther.js
import LiquidEther from '../LiquidEther'; 

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        // 1. CONTEXTO DE CAPAS
        position: 'relative', 
        overflow: 'hidden',
        width: '100%',
        height: '80vh', 
        minHeight: 500,
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        ...theme.applyStyles('dark', {
          backgroundImage: 'none',
        }),
      })}
    >
      
      {/* ---------------------------------------------------------------------- */}
      {/* CAPA 0: EL FONDO (zIndex: 0) */}
      {/* ---------------------------------------------------------------------- */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0, 
        }}
      >
        <LiquidEther
          colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </Box>

      {/* ---------------------------------------------------------------------- */}
      {/* CAPA 1: EL CONTENIDO (zIndex: 1) */}
      {/* ---------------------------------------------------------------------- */}
      <Container
        sx={{
          // CLAVE: zIndex para que el contenido vaya AL FRENTE del fondo (zIndex: 0)
          position: 'relative', 
          zIndex: 1, 
          
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 18, sm: 30 },
          pb: { xs: 8, sm: 15 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
        >
          {/* ------------------- PRIMERA LÍNEA DE TÍTULO ------------------- */}
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
              // 💡 CORRECCIÓN: Color blanco y sombra para el texto principal
              color: 'white', 
              textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5)', 
            }}
          >
            Cambios&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.light', // Color de acento claro
                textShadow: 'inherit',
              })}
            >
              pequeños,
            </Typography>
            &nbsp;
          </Typography>

          {/* ------------------- SEGUNDA LÍNEA DE TÍTULO ------------------- */}
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
              // 💡 CORRECCIÓN: Color blanco y sombra para el texto principal
              color: 'white', 
              textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5)',
            }}
          >
            resultados&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.light', 
                textShadow: 'inherit',
              })}
            >
              extraordinarios
            </Typography>
          </Typography>

          {/* ------------------- SUBTÍTULO ------------------- */}
          <Typography
            sx={{
              textAlign: 'center',
              color: 'grey.300', 
              width: { sm: '100%', md: '80%' },
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            Conviértete en el arquitecto de tus hábitos, no en una víctima de tus caprichos.
          </Typography>
          
          {/* ... (El resto del botón y Stack) ... */}
        </Stack>
      </Container>
    </Box>
  );
}