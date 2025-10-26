import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Chip
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import TaskIcon from '@mui/icons-material/Task';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * Panel de notificaciones funcional
 * Muestra tareas próximas a vencer y hábitos en peligro
 */
export default function NotificationsPanel() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Cargar notificaciones al montar y cada 60 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const notifs = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Obtener tareas próximas a vencer (próximos 3 días)
      const tasksRes = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        tasks.forEach(task => {
          if (task.status !== 'Completada' && task.due_date) {
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);

            // Tarea vencida
            if (dueDate < today) {
              notifs.push({
                id: `task-overdue-${task.id}`,
                type: 'task-overdue',
                title: 'Tarea vencida',
                message: task.title,
                priority: task.priority,
                icon: 'warning',
                color: 'error',
                timestamp: dueDate,
                data: task
              });
            }
            // Tarea vence hoy
            else if (dueDate.getTime() === today.getTime()) {
              notifs.push({
                id: `task-today-${task.id}`,
                type: 'task-today',
                title: 'Vence hoy',
                message: task.title,
                priority: task.priority,
                icon: 'task',
                color: 'warning',
                timestamp: dueDate,
                data: task
              });
            }
            // Tarea próxima (1-3 días)
            else if (dueDate <= threeDaysFromNow) {
              const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              notifs.push({
                id: `task-upcoming-${task.id}`,
                type: 'task-upcoming',
                title: `Vence en ${daysUntil} día${daysUntil > 1 ? 's' : ''}`,
                message: task.title,
                priority: task.priority,
                icon: 'task',
                color: 'info',
                timestamp: dueDate,
                data: task
              });
            }
          }
        });
      }

      // 2. Obtener hábitos en peligro (no completados ayer)
      const habitsRes = await fetch('http://localhost:5000/api/habits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (habitsRes.ok) {
        const habits = await habitsRes.json();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        habits.forEach(habit => {
          if (habit.is_active !== false && habit.streak > 0) {
            const lastCompleted = habit.lastCompleted?.substring(0, 10);
            const todayString = today.toISOString().split('T')[0];

            // Racha en peligro (no completado hoy ni ayer)
            if (lastCompleted !== todayString && lastCompleted === yesterdayString) {
              notifs.push({
                id: `habit-danger-${habit.id}`,
                type: 'habit-danger',
                title: '¡Racha en peligro!',
                message: `${habit.title} - ${habit.streak} días`,
                icon: 'habit',
                color: 'warning',
                timestamp: new Date(habit.lastCompleted),
                data: habit
              });
            }
          }
        });
      }

      // Ordenar por prioridad y fecha
      notifs.sort((a, b) => {
        // Primero por tipo (vencidas > hoy > peligro > próximas)
        const typeOrder = {
          'task-overdue': 1,
          'task-today': 2,
          'habit-danger': 3,
          'task-upcoming': 4
        };
        const orderDiff = typeOrder[a.type] - typeOrder[b.type];
        if (orderDiff !== 0) return orderDiff;

        // Luego por timestamp
        return b.timestamp - a.timestamp;
      });

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (notification.type.startsWith('task')) {
      navigate('/tasks', { state: { openEditModal: true, task: notification.data } });
    } else if (notification.type.startsWith('habit')) {
      navigate('/habits', { state: { openEditModal: true, habit: notification.data } });
    }
    handleClose();
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    handleClose();
  };

  const open = Boolean(anchorEl);

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'task':
        return <TaskIcon fontSize="small" />;
      case 'habit':
        return <TrackChangesIcon fontSize="small" />;
      default:
        return <NotificationsRoundedIcon fontSize="small" />;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        aria-label="notificaciones"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 380,
            maxHeight: 500,
            overflow: 'auto',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllRead}
                sx={{ textTransform: 'none' }}
              >
                Marcar todas como leídas
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* Lista de Notificaciones */}
          {notifications.length > 0 ? (
            <List dense sx={{ py: 0 }}>
              {notifications.map((notif) => (
                <ListItemButton
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: `${notif.color}.main`,
                      bgcolor: `${notif.color}.50`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, width: '100%', alignItems: 'flex-start' }}>
                    {/* Icono */}
                    <Box
                      sx={{
                        mt: 0.5,
                        color: `${notif.color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {getIcon(notif.icon)}
                    </Box>

                    {/* Contenido */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: `${notif.color}.main`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {notif.priority && (
                          <Chip
                            label={notif.priority}
                            size="small"
                            color={
                              notif.priority === 'Alta' ? 'error' :
                              notif.priority === 'Media' ? 'warning' : 'success'
                            }
                            sx={{ height: 16, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notif.message}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                ¡Todo al día!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No tienes notificaciones pendientes
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
