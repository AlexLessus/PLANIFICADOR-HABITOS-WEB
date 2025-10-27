import React, { useState, useEffect } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SimpleStatCard from './SimpleStatCard';

/**
 * Tarjeta que muestra la próxima tarea pendiente
 */
function NextTaskCard() {
  const [loading, setLoading] = useState(true);
  const [nextTask, setNextTask] = useState({
    timeUntil: 'Sin tareas',
    title: 'No hay tareas pendientes'
  });

  useEffect(() => {
    fetchNextTask();
  }, []);

  const fetchNextTask = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        setLoading(false);
        return;
      }

      // Obtener todas las tareas
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener tareas');
      }

      const allTasks = await response.json();

      // Filtrar tareas pendientes con fecha
      const pendingTasks = allTasks.filter(task => 
        task.status === 'Pendiente' && task.due_date
      );

      if (pendingTasks.length === 0) {
        setNextTask({
          timeUntil: 'Sin tareas',
          title: 'No hay tareas pendientes'
        });
        setLoading(false);
        return;
      }

      // Ordenar por fecha más cercana
      pendingTasks.sort((a, b) => 
        new Date(a.due_date) - new Date(b.due_date)
      );

      const nextPendingTask = pendingTasks[0];
      const timeUntil = getTimeUntil(nextPendingTask.due_date);

      setNextTask({
        timeUntil: timeUntil,
        title: nextPendingTask.title
      });

    } catch (error) {
      console.error('Error al cargar próxima tarea:', error);
      setNextTask({
        timeUntil: 'Error',
        title: 'No se pudo cargar'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula el tiempo hasta la fecha de vencimiento
   */
  const getTimeUntil = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;

    // Si ya pasó
    if (diffMs < 0) {
      return 'Vencida';
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Menos de 1 hora
    if (diffMins < 60) {
      return `${diffMins} min`;
    }

    // Menos de 24 horas
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }

    // Menos de 7 días
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }

    // Más de 7 días
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  };

  return (
    <SimpleStatCard
      title="Próxima Tarea"
      value={nextTask.timeUntil}
      subtitle={nextTask.title}
      icon={<AccessTimeIcon />}
      color="#f44336"
      loading={loading}
    />
  );
}

export default NextTaskCard;
