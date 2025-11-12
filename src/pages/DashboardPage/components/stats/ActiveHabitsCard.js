import React, { useState, useEffect } from 'react';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SimpleStatCard from './SimpleStatCard';
import API_URL from '../../../../config/api';

/**
 * Tarjeta que muestra los hábitos activos del usuario
 */
function ActiveHabitsCard() {
  const [loading, setLoading] = useState(true);
  const [habitsData, setHabitsData] = useState({
    total: 0,
    completedToday: 0
  });

  useEffect(() => {
    fetchActiveHabits();
  }, []);

  const fetchActiveHabits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        setLoading(false);
        return;
      }

      // Obtener todos los hábitos
      const habitsResponse = await fetch(`${API_URL}/api/habits`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!habitsResponse.ok) {
        throw new Error('Error al obtener hábitos');
      }

      const habits = await habitsResponse.json();
      const activeHabits = habits.filter(h => h.is_active !== false);

      // Obtener completados de hoy
      const today = new Date().toISOString().split('T')[0];
      const completionsResponse = await fetch(`${API_URL}/api/habits/completions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let completedToday = 0;
      if (completionsResponse.ok) {
        const completions = await completionsResponse.json();
        completedToday = completions.filter(c => {
          const completionDate = c.completion_date.split('T')[0];
          return completionDate === today;
        }).length;
      }

      setHabitsData({
        total: activeHabits.length,
        completedToday: completedToday
      });

    } catch (error) {
      console.error('Error al cargar hábitos activos:', error);
      setHabitsData({
        total: 0,
        completedToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubtitle = () => {
    if (habitsData.total === 0) {
      return 'No hay hábitos activos';
    }
    return `${habitsData.completedToday} completados hoy`;
  };

  return (
    <SimpleStatCard
      title="Hábitos Activos"
      value={habitsData.total}
      subtitle={getSubtitle()}
      icon={<FitnessCenterIcon />}
      color="#4caf50"
      loading={loading}
    />
  );
}

export default ActiveHabitsCard;
