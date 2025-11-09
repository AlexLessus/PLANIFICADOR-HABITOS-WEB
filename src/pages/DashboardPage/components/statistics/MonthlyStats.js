import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * Estadísticas mensuales del usuario
 */
function MonthlyStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksTotal: 0,
    habitsCompletedToday: 0, // CAMBIO: Hábitos completados HOY
    habitsTotal: 0, // CAMBIO: Total de hábitos activos del usuario
    longestStreak: 0,
    perfectDays: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  const fetchMonthlyStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      // Obtener primer y último día del mes actual
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // CAMBIO: Obtener fecha de hoy en formato YYYY-MM-DD (hora local)
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Obtener tareas
      const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!tasksResponse.ok) {
        throw new Error('Error al cargar tareas');
      }

      const tasks = await tasksResponse.json();

      // Filtrar tareas del mes
      const monthTasks = tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate >= firstDay && taskDate <= lastDay;
      });

      const completedTasks = monthTasks.filter(t => t.status === 'Completada').length;

      // Obtener hábitos
      const habitsResponse = await fetch('http://localhost:5000/api/habits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!habitsResponse.ok) {
        throw new Error('Error al cargar hábitos');
      }

      const habits = await habitsResponse.json();
      const activeHabits = habits.filter(h => h.is_active !== false);

      // Obtener completaciones
      const completionsResponse = await fetch('http://localhost:5000/api/habits/completions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let monthCompletions = [];
      let todayCompletions = 0; // CAMBIO: Contador de hábitos completados hoy
      let longestStreak = 0;
      let perfectDays = 0;

      if (completionsResponse.ok) {
        const allCompletions = await completionsResponse.json();
        
        // Filtrar completaciones del mes
        monthCompletions = allCompletions.filter(c => {
          const compDate = new Date(c.completion_date);
          return compDate >= firstDay && compDate <= lastDay;
        });

        // CAMBIO: Contar hábitos completados HOY (considerando zona horaria local)
        todayCompletions = allCompletions.filter(c => {
          // Convertir la fecha de completion a objeto Date
          const compDate = new Date(c.completion_date);
          // Obtener la fecha en formato local YYYY-MM-DD
          const compDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
          return compDateStr === todayStr;
        }).length;

        // Calcular racha más larga
        longestStreak = calculateLongestStreak(allCompletions);

        // Calcular días perfectos (todos los hábitos completados)
        perfectDays = calculatePerfectDays(monthCompletions, activeHabits.length, firstDay, lastDay);
      }

      // CAMBIO: El total es simplemente la cantidad de hábitos activos
      setStats({
        tasksCompleted: completedTasks,
        tasksTotal: monthTasks.length,
        habitsCompletedToday: todayCompletions, // Hábitos completados hoy
        habitsTotal: activeHabits.length, // Total de hábitos activos
        longestStreak: longestStreak,
        perfectDays: perfectDays
      });

    } catch (err) {
      console.error('Error al cargar estadísticas mensuales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula la racha más larga
   */
  const calculateLongestStreak = (completions) => {
    if (completions.length === 0) return 0;

    const uniqueDates = [...new Set(
      completions.map(c => c.completion_date.split('T')[0])
    )].sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  /**
   * Calcula días con 100% de hábitos completados
   */
  const calculatePerfectDays = (completions, totalHabits, firstDay, lastDay) => {
    if (totalHabits === 0) return 0;

    let perfectDays = 0;
    const currentDate = new Date(firstDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= lastDay && currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const completedThatDay = completions.filter(c => 
        c.completion_date.split('T')[0] === dateStr
      ).length;

      if (completedThatDay === totalHabits) {
        perfectDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return perfectDays;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando estadísticas...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Paper>
    );
  }

  const tasksPercentage = stats.tasksTotal > 0
    ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100)
    : 0;

  // CAMBIO: Porcentaje basado en hábitos completados hoy vs total de hábitos
  const habitsPercentage = stats.habitsTotal > 0
    ? Math.round((stats.habitsCompletedToday / stats.habitsTotal) * 100)
    : 0;

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        🏆 Estadísticas del Mes
      </Typography>

      <Grid container spacing={2}>
        {/* Tareas Completadas */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="#2196f3">
              {stats.tasksCompleted}/{stats.tasksTotal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tareas Completadas
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="#2196f3" sx={{ mt: 1 }}>
              {tasksPercentage}%
            </Typography>
          </Box>
        </Grid>

        {/* Hábitos Cumplidos HOY */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="#4caf50">
              {stats.habitsCompletedToday}/{stats.habitsTotal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hábitos Cumplidos Hoy
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="#4caf50" sx={{ mt: 1 }}>
              {habitsPercentage}%
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Racha Más Larga */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <LocalFireDepartmentIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="#ff9800">
              {stats.longestStreak}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Racha Más Larga
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Días consecutivos
            </Typography>
          </Box>
        </Grid>

        {/* Días Perfectos */}
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="#9c27b0">
              {stats.perfectDays}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Días Perfectos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              100% de hábitos
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Mensaje motivacional */}
      {habitsPercentage >= 80 && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#4caf5020', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="#4caf50" fontWeight="bold">
            🎉 ¡Excelente día! Mantén el ritmo
          </Typography>
        </Box>
      )}
      
      {habitsPercentage === 100 && stats.habitsTotal > 0 && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#ff980020', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="#ff9800" fontWeight="bold">
            🔥 ¡Día perfecto! Todos los hábitos completados
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default MonthlyStats;