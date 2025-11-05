// src/pages/Progress/HabitPet.jsx
import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import './HabitPet.css';
import phase1 from '../../assets/pets/phase1.png';
import phase2 from '../../assets/pets/phase2.png';
import phase3 from '../../assets/pets/phase3.png';
import sad from '../../assets/pets/sad.png';
import bones from '../../assets/pets/bones.png';

const images = {
  phase1,
  phase2,
  phase3,
  sad,
  bones
};

const HabitPet = ({ completions }) => {
  const estadoMascota = useMemo(() => {
    if (!completions || completions.length === 0) return 'phase1';

    const dates = completions.map(c => c.completion_date.split('T')[0]);
    const ultimoDia = dates.sort((a, b) => new Date(b) - new Date(a))[0];
    const racha = calcularRacha(completions);
    return obtenerEstadoMascota(racha, ultimoDia);
  }, [completions]);

  return (
    <Box className={`pet-container ${estadoMascota}`}>
          <img
              src={images[estadoMascota]}
              alt={`Mascota ${estadoMascota}`}
              className="pet-image"
          />
      <Typography variant="subtitle1" align="center">
        {estadoMascota === 'phase1' && 'Tu compañero está comenzando su viaje '}
        {estadoMascota === 'phase2' && '¡Va mejorando cada día! 💪'}
        {estadoMascota === 'phase3' && '¡Imparable, está en su mejor forma! 🦁'}
        {estadoMascota === 'sad' && 'Se siente triste… ¡vuelve a tus hábitos! 😢'}
        {estadoMascota === 'bones' && 'Oh no… está en los huesos 💀. ¡Recupéralo!'}
      </Typography>
    </Box>
  );
};

// Lógica local 
function calcularRacha(completions) {
  if (!completions || completions.length === 0) return 0;
  const dates = completions
    .map(c => new Date(c.completion_date.split('T')[0]))
    .sort((a, b) => b - a);
  let racha = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) racha++;
    else break;
  }
  return racha;
}

function obtenerEstadoMascota(racha, ultimoDiaCompletado) {
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - new Date(ultimoDiaCompletado)) / (1000 * 60 * 60 * 24));

  if (diferenciaDias >= 7) return 'bones';
  if (diferenciaDias >= 2) return 'sad';
  if (racha < 3) return 'phase1';
  if (racha < 7) return 'phase2';
  return 'phase3';
}

export default HabitPet;
