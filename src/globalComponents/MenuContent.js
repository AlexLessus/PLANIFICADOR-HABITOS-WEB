import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TaskIcon from '@mui/icons-material/Task';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

import { useLocation, Link } from 'react-router-dom';

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, to: '/dashboard' },
  { text: 'Habitos', icon: <TrackChangesIcon />, to: '/habits' },
  { text: 'Tareas', icon: <TaskIcon />, to: '/tasks' },
  { text: 'Calendario', icon: <CalendarTodayIcon />, to: '/calendar' },
  { text: 'Progreso', icon: <DonutLargeIcon />, to: '/progress' },
];

const secondaryListItems = [
  { text: 'Ajustes', icon: <SettingsRoundedIcon />, to: '/' },
  { text: 'SignIn', icon: <SettingsRoundedIcon />, to: '/signin' },
  { text: 'SignUp', icon: <SettingsRoundedIcon />, to: '/signup' },
];

export default function MenuContent() {
  const location = useLocation();
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
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
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
      </List>
    </Stack>
  );
}