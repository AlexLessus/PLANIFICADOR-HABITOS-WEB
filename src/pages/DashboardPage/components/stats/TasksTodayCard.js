import React, { useState, useEffect } from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SimpleStatCard from './SimpleStatCard';
import API_URL from '../../../../config/api';

/**
 * Tarjeta que muestra las tareas del día actual
 */
function TasksTodayCard() {
  const [loading, setLoading] = useState(true);
  const [tasksData, setTasksData] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchTasksToday();
  }, []);

  const fetchTasksToday = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        setLoading(false);
        return;
      }

      // Obtener fecha de hoy en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // Obtener todas las tareas
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener tareas');
      }

      const allTasks = await response.json();

      // Filtrar tareas de hoy
      const todayTasks = allTasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = task.due_date.split('T')[0];
        return taskDate === today;
      });

      // Calcular estadísticas
      const completed = todayTasks.filter(t => t.status === 'Completada').length;
      const pending = todayTasks.filter(t => t.status === 'Pendiente').length;

      setTasksData({
        total: todayTasks.length,
        completed: completed,
        pending: pending
      });

    } catch (error) {
      console.error('Error al cargar tareas de hoy:', error);
      // Usar datos mock en caso de error
      setTasksData({
        total: 0,
        completed: 0,
        pending: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubtitle = () => {
    if (tasksData.total === 0) {
      return 'No hay tareas para hoy';
    }
    return `${tasksData.completed} completadas, ${tasksData.pending} pendientes`;
  };

  return (
    <SimpleStatCard
      title="Tareas de Hoy"
      value={tasksData.total}
      subtitle={getSubtitle()}
      icon={<AssignmentIcon />}
      color="#2196f3"
      loading={loading}
    />
  );
}

export default TasksTodayCard;
