import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  InputAdornment,
  Popover,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import API_URL from '../config/api';
import TaskIcon from '@mui/icons-material/Task';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

/**
 * Barra de búsqueda funcional para tareas y hábitos
 */
export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ tasks: [], habits: [] });
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchItems();
        // Abrir popover cuando hay búsqueda
        if (inputRef.current) {
          setAnchorEl(inputRef.current);
        }
      }, 300); // Esperar 300ms después de que el usuario deje de escribir

      return () => clearTimeout(timeoutId);
    } else {
      setResults({ tasks: [], habits: [] });
      setAnchorEl(null); // Cerrar si hay menos de 2 caracteres
    }
  }, [searchTerm]);

  // Atajo de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC para cerrar
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Buscar tareas
      const tasksRes = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let filteredTasks = [];
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        filteredTasks = tasks.filter(t => 
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 5); // Máximo 5 resultados
      }

      // Buscar hábitos
      const habitsRes = await fetch(`${API_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let filteredHabits = [];
      if (habitsRes.ok) {
        const habits = await habitsRes.json();
        filteredHabits = habits.filter(h => 
          h.title.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Máximo 5 resultados
      }

      setResults({ tasks: filteredTasks, habits: filteredHabits });
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (event) => {
    // Solo establecer anchorEl si hay resultados
    if (searchTerm.length >= 2) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleBlur = () => {
    // Cerrar con un pequeño delay para permitir clicks en resultados
    setTimeout(() => {
      setAnchorEl(null);
    }, 200);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchTerm('');
    setResults({ tasks: [], habits: [] });
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults({ tasks: [], habits: [] });
  };

  const handleSelectTask = (task) => {
    navigate('/tasks', { state: { openEditModal: true, task: task } });
    handleClose();
  };

  const handleSelectHabit = (habit) => {
    navigate('/habits', { state: { openEditModal: true, habit: habit } });
    handleClose();
  };

  const open = Boolean(anchorEl) && searchTerm.length >= 2;
  const hasResults = results.tasks.length > 0 || results.habits.length > 0;

  return (
    <>
      <TextField
        inputRef={inputRef}
        size="small"
        placeholder="Buscar... (Ctrl+K)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ 
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          }
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableScrollLock
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          backdrop: {
            invisible: true,
          }
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 400,
            maxHeight: 400,
            overflow: 'auto',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : hasResults ? (
            <>
              {/* Resultados de Tareas */}
              {results.tasks.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', px: 1 }}>
                    TAREAS ({results.tasks.length})
                  </Typography>
                  <List dense sx={{ py: 0.5 }}>
                    {results.tasks.map((task) => (
                      <ListItemButton 
                        key={task.id} 
                        onClick={() => handleSelectTask(task)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <TaskIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {task.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={task.priority} 
                                  size="small"
                                  color={
                                    task.priority === 'Alta' ? 'error' :
                                    task.priority === 'Media' ? 'warning' : 'success'
                                  }
                                  sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                                {task.description && (
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1
                                    }}
                                  >
                                    {task.description}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </>
              )}

              {/* Divider si hay ambos tipos de resultados */}
              {results.tasks.length > 0 && results.habits.length > 0 && (
                <Divider sx={{ my: 1 }} />
              )}

              {/* Resultados de Hábitos */}
              {results.habits.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', px: 1 }}>
                    HÁBITOS ({results.habits.length})
                  </Typography>
                  <List dense sx={{ py: 0.5 }}>
                    {results.habits.map((habit) => (
                      <ListItemButton 
                        key={habit.id} 
                        onClick={() => handleSelectHabit(habit)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <TrackChangesIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {habit.title}
                            </Typography>
                          }
                          secondary={
                            habit.streak > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                🔥 {habit.streak} días
                              </Typography>
                            )
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No se encontraron resultados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Intenta con otro término de búsqueda
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
}
