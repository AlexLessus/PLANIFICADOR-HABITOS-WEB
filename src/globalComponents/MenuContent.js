import * as React from 'react';
import { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TaskIcon from '@mui/icons-material/Task';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import API_URL from '../config/api';

import { useLocation, Link } from 'react-router-dom';

export default function MenuContent() {
  const location = useLocation();
  const [counts, setCounts] = useState({
    tasks: 0,
    habits: 0
  });

  useEffect(() => {
    fetchCounts();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Obtener tareas pendientes
      const tasksRes = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
        
        // Obtener hábitos activos
        const habitsRes = await fetch(`${API_URL}/api/habits`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (habitsRes.ok) {
          const habits = await habitsRes.json();
          const activeHabits = habits.filter(h => h.is_active !== false).length;
          
          setCounts({
            tasks: pendingTasks,
            habits: activeHabits
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener contadores:', error);
    }
  };

  const mainListItems = [
    { text: 'Dashboard', icon: <HomeRoundedIcon />, to: '/dashboard' },
    { 
      text: 'Hábitos', 
      icon: <TrackChangesIcon />, 
      to: '/habits',
      badge: counts.habits,
      badgeColor: 'success'
    },
    { 
      text: 'Tareas', 
      icon: <TaskIcon />, 
      to: '/tasks',
      badge: counts.tasks,
      badgeColor: 'error'
    },
    { text: 'Calendario', icon: <CalendarTodayIcon />, to: '/calendar' },
    { text: 'Progreso', icon: <DonutLargeIcon />, to: '/progress' },
  ];

  // const secondaryListItems = [
  //   { text: 'Ajustes', icon: <SettingsRoundedIcon />, to: '/settings' },
  // ];

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={location.pathname === item.to}
            >
              <ListItemIcon>
                {item.badge !== undefined ? (
                  <Badge 
                    badgeContent={item.badge} 
                    color={item.badgeColor}
                    max={99}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.to}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Stack>
  );
}