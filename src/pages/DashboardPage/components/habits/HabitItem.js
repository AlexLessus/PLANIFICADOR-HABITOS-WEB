import React from 'react';
import PropTypes from 'prop-types';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Box,
  Typography,
  Chip
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

/**
 * Componente individual de hábito para la lista de hoy
 */
function HabitItem({ habit, isCompleted, onToggleComplete }) {
  return (
    <ListItem
      disablePadding
      sx={{
        mb: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        borderLeft: `4px solid ${isCompleted ? '#4caf50' : '#9e9e9e'}`,
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <ListItemButton 
        onClick={() => onToggleComplete(habit)}
        dense
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Checkbox
            edge="start"
            checked={isCompleted}
            tabIndex={-1}
            disableRipple
            sx={{
              color: '#9e9e9e',
              '&.Mui-checked': {
                color: '#4caf50'
              }
            }}
          />
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  color: isCompleted ? 'text.secondary' : 'text.primary',
                  fontWeight: isCompleted ? 400 : 500
                }}
              >
                {habit.title}
              </Typography>

              {/* Mostrar racha si existe */}
              {habit.streak > 0 && (
                <Chip
                  icon={<LocalFireDepartmentIcon sx={{ fontSize: 14 }} />}
                  label={`${habit.streak} días`}
                  size="small"
                  sx={{
                    bgcolor: '#ff980020',
                    color: '#ff9800',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              )}
            </Box>
          }
          secondary={
            habit.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: '100%'
                }}
              >
                {habit.description}
              </Typography>
            )
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

HabitItem.propTypes = {
  habit: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    frequency: PropTypes.string,
    streak: PropTypes.number
  }).isRequired,
  isCompleted: PropTypes.bool.isRequired,
  onToggleComplete: PropTypes.func.isRequired
};

export default HabitItem;
