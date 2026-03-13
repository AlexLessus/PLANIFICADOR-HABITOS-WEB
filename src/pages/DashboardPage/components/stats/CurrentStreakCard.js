import React, { useState, useEffect } from 'react';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SimpleStatCard from './SimpleStatCard';
import API_URL from '../../../../config/api';

/**
 * Tarjeta que muestra la racha actual del usuario
 * Calcula la racha basándose en días consecutivos con al menos un hábito completado
 */
function CurrentStreakCard() {
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({
    days: 0,
    message: ''
  });

  useEffect(() => {
    calculateStreak();
  }, []);

  const calculateStreak = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        setLoading(false);
        return;
      }

      // Obtener todas las completaciones de hábitos
      const response = await fetch(`${API_URL}/api/habits/completions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener completaciones');
      }

      const completions = await response.json();

      // Calcular racha
      const streak = calculateStreakDays(completions);

      setStreakData({
        days: streak,
        message: getStreakMessage(streak)
      });

    } catch (error) {
      console.error('Error al calcular racha:', error);
      setStreakData({
        days: 0,
        message: 'Sin racha activa'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula los días consecutivos con al menos un hábito completado
   */
  const calculateStreakDays = (completions) => {
    if (completions.length === 0) return 0;

    // Obtener fechas únicas de completaciones (solo la parte de fecha)
    const uniqueDates = [...new Set(
      completions.map(c => c.completion_date.split('T')[0])
    )].sort().reverse(); // Ordenar de más reciente a más antigua

    if (uniqueDates.length === 0) return 0;

    // Verificar si hay una completación hoy
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // La racha solo cuenta si hay actividad hoy o ayer
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    // Contar días consecutivos
    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  };

  /**
   * Genera un mensaje motivacional basado en la racha
   */
  const getStreakMessage = (days) => {
    if (days === 0) return 'Comienza tu racha hoy';
    if (days === 1) return '¡Buen comienzo!';
    if (days < 7) return '¡Sigue así!';
    if (days < 30) return '¡Excelente progreso!';
    return '¡Increíble dedicación!';
  };

  return (
    <SimpleStatCard
      title="Racha Actual"
      value={`${streakData.days} ${streakData.days === 1 ? 'día' : 'días'}`}
      subtitle={streakData.message}
      icon={<LocalFireDepartmentIcon />}
      color="#ff9800"
      loading={loading}
    />
  );
}

export default CurrentStreakCard;
