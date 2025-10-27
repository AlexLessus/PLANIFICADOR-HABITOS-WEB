import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Paper,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TaskItem from './TaskItem';

/**
 * Lista de tareas próximas en el Dashboard
 */
function UpcomingTasksList() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcomingTasks();
  }, []);

  const fetchUpcomingTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar tareas');
      }

      const allTasks = await response.json();

      // Filtrar tareas pendientes con fecha
      const pendingTasks = allTasks.filter(task => 
        task.status === 'Pendiente' && task.due_date
      );

      // Ordenar por fecha más cercana
      pendingTasks.sort((a, b) => 
        new Date(a.due_date) - new Date(b.due_date)
      );

      // Tomar las primeras 10
      const upcomingTasks = pendingTasks.slice(0, 10);

      setTasks(upcomingTasks);

    } catch (err) {
      console.error('Error al cargar tareas próximas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marca una tarea como completada o pendiente
   */
  const handleToggleComplete = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = task.status === 'Completada' ? 'Pendiente' : 'Completada';

      const response = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...task,
          status: newStatus,
          due_date: task.due_date ? task.due_date.split('T')[0] : null
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar tarea');
      }

      // Recargar tareas
      await fetchUpcomingTasks();

    } catch (err) {
      console.error('Error al cambiar estado de tarea:', err);
      alert('Error al actualizar la tarea. Inténtalo de nuevo.');
    }
  };

  /**
   * Abre modal de edición (por implementar)
   */
  const handleEdit = (task) => {
    // Por ahora, redirigir a la página de tareas
    console.log('Editar tarea:', task);
    // TODO: Implementar modal de edición o redirección
    alert(`Editar tarea: ${task.title}\n\nEsta funcionalidad se puede implementar con un modal o redirigiendo a /tasks`);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando tareas...
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

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📅 Tareas Próximas
          {tasks.length > 0 && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 600
              }}
            >
              {tasks.length}
            </Typography>
          )}
        </Typography>

        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => window.location.href = '/tasks'}
        >
          Nueva Tarea
        </Button>
      </Box>

      {/* Lista de tareas */}
      {tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            🎉 No hay tareas pendientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ¡Buen trabajo! Todas tus tareas están completadas.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/tasks'}
          >
            Crear Nueva Tarea
          </Button>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
            />
          ))}
        </List>
      )}

      {/* Footer con link a ver todas */}
      {tasks.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => window.location.href = '/tasks'}
          >
            Ver todas las tareas
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default UpcomingTasksList;
