import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Paper,
  CircularProgress,
  LinearProgress,
  Button,
  Alert,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HabitItem from './HabitItem';
import API_URL from '../../../../config/api';

/**
 * Panel de hábitos de hoy en el Dashboard
 */
function TodayHabitsPanel() {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayHabits();
  }, []);

  /**
   * Convierte una fecha a string local YYYY-MM-DD
   */
  const dateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchTodayHabits = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
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
        throw new Error('Error al cargar hábitos');
      }

      const allHabits = await habitsResponse.json();
      const activeHabits = allHabits.filter(h => h.is_active !== false);

      // Obtener completaciones de hoy (usando hora local)
      const today = dateToLocalString(new Date());
      const completionsResponse = await fetch(`${API_URL}/api/habits/completions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let completedHabitIds = [];
      let allCompletions = [];
      
      if (completionsResponse.ok) {
        allCompletions = await completionsResponse.json();
        completedHabitIds = allCompletions
          .filter(c => {
            const compDate = new Date(c.completion_date);
            const compDateStr = dateToLocalString(compDate);
            return compDateStr === today;
          })
          .map(c => c.habit_id);
      }

      // Calcular racha para cada hábito
      const habitsWithStreak = activeHabits.map(habit => {
        const habitCompletions = allCompletions.filter(c => c.habit_id === habit.id);
        
        return {
          ...habit,
          streak: calculateStreak(habitCompletions)
        };
      });

      setHabits(habitsWithStreak);
      setCompletedToday(completedHabitIds);

    } catch (err) {
      console.error('Error al cargar hábitos de hoy:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula la racha de días consecutivos para un hábito
   */
  const calculateStreak = (completions) => {
    if (completions.length === 0) return 0;

    const uniqueDates = [...new Set(
      completions.map(c => {
        const compDate = new Date(c.completion_date);
        return dateToLocalString(compDate);
      })
    )].sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const today = dateToLocalString(new Date());
    const yesterday = dateToLocalString(new Date(Date.now() - 86400000));

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

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
   * Marca o desmarca un hábito como completado hoy
   */
  const handleToggleComplete = async (habit) => {
    try {
      const token = localStorage.getItem('token');
      const isCurrentlyCompleted = completedToday.includes(habit.id);

      if (isCurrentlyCompleted) {
        // Si ya está completado, no hacer nada (o mostrar mensaje)
        console.log('El hábito ya está completado hoy');
        return;
      }

      // Marcar como completado usando el endpoint correcto
      const response = await fetch(`${API_URL}/api/habits/${habit.id}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al completar hábito');
      }

      // Recargar hábitos para reflejar el cambio
      await fetchTodayHabits();

    } catch (err) {
      console.error('Error al cambiar estado de hábito:', err);
      // No mostrar alert si el error es que ya está completado
      if (!err.message.includes('ya fue completado')) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  /**
   * Calcula el porcentaje de progreso
   */
  const getProgress = () => {
    if (habits.length === 0) return 0;
    return Math.round((completedToday.length / habits.length) * 100);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando hábitos...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Paper>
    );
  }

  const progress = getProgress();

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            ✅ Hábitos de Hoy
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/habits'}
          >
            Nuevo
          </Button>
        </Box>

        {/* Barra de progreso */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progreso del día
            </Typography>
            <Typography variant="caption" fontWeight="bold" color={progress === 100 ? 'success.main' : 'text.secondary'}>
              {completedToday.length}/{habits.length} ({progress}%)
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: progress === 100 ? '#4caf50' : '#2196f3',
                borderRadius: 1
              }
            }}
          />
        </Box>

        {/* Mensaje motivacional */}
        {progress === 100 && habits.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1, bgcolor: '#4caf5020', borderRadius: 1 }}>
            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
            <Typography variant="caption" color="#4caf50" fontWeight="bold">
              ¡Excelente! Completaste todos tus hábitos de hoy 🎉
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Lista de hábitos */}
      {habits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            📝 No tienes hábitos activos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Crea tu primer hábito para comenzar
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/habits'}
          >
            Crear Primer Hábito
          </Button>
        </Box>
      ) : (
        <List sx={{ p: 0, flexGrow: 1, overflow: 'auto', maxHeight: 400 }}>
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              isCompleted={completedToday.includes(habit.id)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </List>
      )}

      {/* Footer */}
      {habits.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => window.location.href = '/habits'}
          >
            Ver todos los hábitos
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default TodayHabitsPanel;