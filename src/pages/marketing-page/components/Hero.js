import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// ... (otras importaciones)
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

// Rutas para encontrar estilos de la home page
import DarkVeil from '../DarkVeil';
//import LiquidEther from '../LiquidEther';

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
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
      <Box 
        sx={{
          // Lo saca del flujo de documentos para que no empuje el contenido
          position: 'absolute',
          // Lo estira para que cubra exactamente el Box padre
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // Capa de fondo
          zIndex: 0, 
        }}
      >
        <DarkVeil />
      </Box>

      <Container
        sx={{
          // CLAVE: zIndex para que el contenido vaya AL FRENTE del fondo (zIndex: 0)
          position: 'relative', 
          zIndex: 1, // CLAVE: Capa superior
          
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
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
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

          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
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

          
          <Typography
            sx={{
              textAlign: 'center',
              color: 'grey.300', 
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              width: { sm: '100%', md: '80%' },
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            Conviértete en el arquitecto de tus hábitos, no en una víctima de tus caprichos.
          </Typography>
          

        </Stack>
      </Container>
    </Box >
  );
}