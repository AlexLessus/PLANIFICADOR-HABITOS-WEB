import React from 'react';
import PropTypes from 'prop-types';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';

/**
 * Componente individual de tarea para la lista
 */
function TaskItem({ task, onToggleComplete, onEdit }) {
  const isCompleted = task.status === 'Completada';

  // Colores por prioridad
  const priorityColors = {
    'Alta': '#f44336',
    'Media': '#ff9800',
    'Baja': '#2196f3'
  };

  const priorityColor = priorityColors[task.priority] || '#9e9e9e';

  /**
   * Calcula el tiempo relativo hasta la fecha de vencimiento
   */
  const getTimeUntil = (dueDate) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;

    // Si ya pasó
    if (diffMs < 0) {
      return { text: 'Vencida', color: '#f44336' };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Hoy
    if (diffDays === 0) {
      return { text: 'Hoy', color: '#f44336' };
    }

    // Mañana
    if (diffDays === 1) {
      return { text: 'Mañana', color: '#ff9800' };
    }

    // En X días
    if (diffDays < 7) {
      return { text: `En ${diffDays} días`, color: '#2196f3' };
    }

    // Más de una semana
    const weeks = Math.floor(diffDays / 7);
    return { text: `En ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`, color: '#9e9e9e' };
  };

  const timeInfo = getTimeUntil(task.due_date);

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton 
          edge="end" 
          aria-label="editar"
          onClick={() => onEdit(task)}
          size="small"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      }
      sx={{
        borderLeft: `4px solid ${priorityColor}`,
        mb: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <ListItemButton 
        onClick={() => onToggleComplete(task)}
        dense
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Checkbox
            edge="start"
            checked={isCompleted}
            tabIndex={-1}
            disableRipple
            sx={{
              color: priorityColor,
              '&.Mui-checked': {
                color: '#4caf50'
              }
            }}
          />
        </ListItemIcon>

        <ListItemText
          primary={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                component="span"
                variant="body1"
                sx={{
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'text.secondary' : 'text.primary',
                  fontWeight: isCompleted ? 400 : 500
                }}
              >
                {task.title}
              </Typography>
              
              {/* Chip de prioridad */}
              <Chip
                label={task.priority}
                size="small"
                sx={{
                  bgcolor: `${priorityColor}20`,
                  color: priorityColor,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Box>
          }
          secondary={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {timeInfo && (
                <>
                  <AccessTimeIcon sx={{ fontSize: 14, color: timeInfo.color }} />
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ color: timeInfo.color, fontWeight: 500 }}
                  >
                    {timeInfo.text}
                  </Typography>
                </>
              )}
              
              {task.description && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ml: timeInfo ? 1 : 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 200
                  }}
                >
                  • {task.description}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.oneOf(['Alta', 'Media', 'Baja']).isRequired,
    status: PropTypes.oneOf(['Pendiente', 'Completada']).isRequired,
    due_date: PropTypes.string
  }).isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default TaskItem;
