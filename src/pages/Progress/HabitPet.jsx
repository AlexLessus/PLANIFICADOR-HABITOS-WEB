// src/pages/Progress/HabitPet.jsx
import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import './HabitPet.css';
import phase1 from '../../assets/pets/phase1.png';
import phase2 from '../../assets/pets/phase2.png';
import phase3 from '../../assets/pets/phase3.png';
import sad from '../../assets/pets/sad.png';
import bones from '../../assets/pets/bones.png';

const images = { phase1, phase2, phase3, sad, bones };

const HabitPet = ({ habits }) => {
  // --- Determinar el estado de la mascota con la racha real del backend ---
  const estadoMascota = useMemo(() => {
    if (!habits || habits.length === 0) return 'phase1';

    // Tomamos la racha más alta de todos los hábitos como indicador del progreso general.
    const maxStreak = Math.max(...habits.map(h => h.streak || 0));
    const lastCompletedDates = habits
      .map(h => h.lastCompleted)
      .filter(Boolean)
      .map(d => new Date(d));
    const lastCompleted = lastCompletedDates.length
      ? new Date(Math.max(...lastCompletedDates))
      : null;

    return obtenerEstadoMascota(maxStreak, lastCompleted);
  }, [habits]);

  return (
    <Box className={`pet-container ${estadoMascota}`}>
      <img
        src={images[estadoMascota]}
        alt={`Mascota ${estadoMascota}`}
        className="pet-image"
      />
      <Typography variant="subtitle1" align="center">
        {estadoMascota === 'phase1' && 'Tu compañero está comenzando su viaje '}
        {estadoMascota === 'phase2' && '¡Va mejorando cada día! '}
        {estadoMascota === 'phase3' && '¡Imparable, está en su mejor forma! '}
        {estadoMascota === 'sad' && 'Se siente triste… ¡vuelve a tus hábitos! '}
        {estadoMascota === 'bones' && 'Oh no… está en los huesos 💀. ¡Recupéralo!'}
      </Typography>
    </Box>
  );
};

// --- Determinar fase en función de la racha y último día completado ---
function obtenerEstadoMascota(racha, ultimoDiaCompletado) {
  if (!ultimoDiaCompletado) return 'phase1';

  const hoy = new Date();
  const diff = Math.floor((hoy - ultimoDiaCompletado) / (1000 * 60 * 60 * 24));

  if (diff >= 7) return 'bones';
  if (diff >= 2) return 'sad';
  if (racha < 3) return 'phase1';
  if (racha < 7) return 'phase2';
  return 'phase3';
}

export default HabitPet;
