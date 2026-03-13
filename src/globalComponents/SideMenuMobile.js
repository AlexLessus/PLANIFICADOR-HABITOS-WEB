import * as React from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import AuthContext from '../context/AuthContext';
import { SitemarkIcon } from '../shared-theme/CustomIcons';

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

function SideMenuMobile({ open, toggleDrawer }) {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toggleDrawer(false)();
    navigate('/signin');
  };

  if (!currentUser) {
    return null;
  }

  const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
          width: { xs: '85vw', sm: '320px' },
          maxWidth: '85vw',
        },
      }}
    >
      <Stack
        sx={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header del menú móvil */}
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SitemarkIcon />
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            Tiger Habit Planner
          </Typography>
          <IconButton
            onClick={toggleDrawer(false)}
            size="small"
            aria-label="Cerrar menú"
            sx={{
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {/* Contenido del menú */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            py: 1,
          }}
        >
          <MenuContent />
        </Box>

        <Divider />

        {/* Footer con información del usuario */}
        <Stack
          sx={{
            p: 2,
            gap: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Información del usuario */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              alt={fullName}
              sx={{
                width: 40,
                height: 40,
                bgcolor: getAvatarColor(currentUser.first_name),
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {getInitials(currentUser.first_name, currentUser.last_name)}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fullName || 'Usuario'}
              </Typography>
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
            </Box>
          </Stack>

          {/* Botón de logout */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            sx={{
              minHeight: 44,
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cerrar Sesión
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
