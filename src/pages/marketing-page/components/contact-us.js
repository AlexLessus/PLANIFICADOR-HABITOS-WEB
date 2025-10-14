import * as React from 'react';
import Box from '@mui/material/Box'; 
import MagicBento from '../MagicBento'; 

export default function ContactUsSection() {
  return (
    <Box
      id="contact-us" 
      sx={{
        pt: { xs: 8, sm: 16 },
        pb: { xs: 8, sm: 16 },

        
        display: 'flex',
        justifyContent: 'center', // Centra el contenido horizontalmente
        alignItems: 'center',    // Centra el contenido verticalmente 
      }}
    >
      <MagicBento
        textAutoHide={true}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
        spotlightRadius={300}
        particleCount={12}
        glowColor="132, 0, 255"
      />
    </Box>
  );
}