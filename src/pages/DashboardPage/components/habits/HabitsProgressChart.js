import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import API_URL from '../../../../config/api';

/**
 * Gráfico de progreso de hábitos de los últimos días
 */
function HabitsProgressChart() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7); // 7 o 30 días

  useEffect(() => {
    fetchProgressData();
  }, [days]);

  const fetchProgressData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      // Obtener hábitos
      const habitsResponse = await fetch(`${API_URL}/api/habits`, {
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
      const completionsResponse = await fetch(`${API_URL}/api/habits/completions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!completionsResponse.ok) {
        throw new Error('Error al cargar completaciones');
      }

      const completions = await completionsResponse.json();

      // Generar datos para los últimos N días
      const data = generateChartData(activeHabits.length, completions, days);
      setChartData(data);

    } catch (err) {
      console.error('Error al cargar datos del gráfico:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convierte una fecha a string local YYYY-MM-DD
   */
  const dateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Genera datos del gráfico para los últimos N días
   */
  const generateChartData = (totalHabits, completions, numDays) => {
    const data = [];
    const today = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = dateToLocalString(date);

      // Contar hábitos completados ese día (considerando zona horaria local)
      const completedCount = completions.filter(c => {
        const compDate = new Date(c.completion_date);
        const compDateStr = dateToLocalString(compDate);
        return compDateStr === dateStr;
      }).length;

      // Calcular porcentaje
      const percentage = totalHabits > 0 
        ? Math.round((completedCount / totalHabits) * 100)
        : 0;

      // Nombre del día
      const dayName = i === 0 
        ? 'Hoy'
        : i === 1
        ? 'Ayer'
        : date.toLocaleDateString('es-ES', { weekday: 'short' });

      data.push({
        date: dateStr,
        day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        completed: completedCount,
        total: totalHabits,
        percentage: percentage
      });
    }

    return data;
  };

  /**
   * Determina el color de la barra según el porcentaje
   */
  const getBarColor = (percentage) => {
    if (percentage >= 80) return '#4caf50'; // Verde
    if (percentage >= 50) return '#ff9800'; // Naranja
    return '#f44336'; // Rojo
  };

  /**
   * Tooltip personalizado
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            {data.day}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.completed}/{data.total} hábitos
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight="bold"
            sx={{ color: getBarColor(data.percentage) }}
          >
            {data.percentage}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando gráfico...
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

  // Calcular promedio
  const avgPercentage = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.percentage, 0) / chartData.length)
    : 0;

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📈 Progreso de Hábitos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Promedio: {avgPercentage}%
          </Typography>
        </Box>

        {/* Toggle para cambiar período */}
        <ToggleButtonGroup
          value={days}
          exclusive
          onChange={(e, newValue) => newValue && setDays(newValue)}
          size="small"
        >
          <ToggleButton value={7}>7 días</ToggleButton>
          <ToggleButton value={30}>30 días</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Gráfico */}
      {chartData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No hay datos suficientes para mostrar el gráfico
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="percentage" 
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Leyenda */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: 1 }} />
          <Typography variant="caption">≥80%</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: 1 }} />
          <Typography variant="caption">50-79%</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: 1 }} />
          <Typography variant="caption">&lt;50%</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default HabitsProgressChart;