import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Tooltip from '@mui/material/Tooltip';
import { SitemarkIcon } from '../shared-theme/CustomIcons';


const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

// Función para obtener iniciales del nombre
const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || '?';
};

// Función para generar color basado en el nombre
const getAvatarColor = (name) => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ff9800', '#ff5722', '#795548', '#607d8b'
  ];
  
  if (!name) return colors[0];
  
  const charCode = name.charCodeAt(0);
  const index = charCode % colors.length;
  return colors[index];
};

export default function SideMenu() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  // Construir el nombre completo para el tooltip
  const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
        marginTop: '64px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <SitemarkIcon />
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: 'text.primary', 
            position: 'relative', 
            left: 10, 
            fontSize: 20, 
            fontWeight: 'bold' 
          }}
        >
          Tiger Habit Planner
        </Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="big"
          alt={fullName}
          sx={{ 
            width: 36, 
            height: 36,
            bgcolor: getAvatarColor(currentUser.first_name),
            fontWeight: 'bold',
            flexShrink: 0, // Evita que el avatar se encoja
          }}
        >
          {getInitials(currentUser.first_name, currentUser.last_name)}
        </Avatar>
        <Box 
          sx={{ 
            mr: 'auto',
            minWidth: 0, // Permite que el contenido se encoja
            flex: 1, // Toma el espacio disponible
          }}
        >
          <Tooltip title={`${fullName}\n${currentUser.email}`} arrow>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {currentUser.first_name}
            </Typography>
          </Tooltip>
          <Tooltip title={currentUser.email} arrow>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {currentUser.email}
            </Typography>
          </Tooltip>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}