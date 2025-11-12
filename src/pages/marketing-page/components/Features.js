import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MuiChip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
//imagenes de caracteristicas
import habitPageImg from '../../../assets/screenshots/habitPage.png';
import Dashboard from '../../../assets/screenshots/dashboard.png';
import Taskmanager from '../../../assets/screenshots/task.png';
//modo claro
import habitPageLight from '../../../assets/screenshots/habitPageLight.png';
import DashboardLight from '../../../assets/screenshots/dashboardLight.png';
import TaskmanagerLight from '../../../assets/screenshots/taskLight.png';
//animacion de componente
import GlowCard from './GlowCard'; 
import TaskIcon from '@mui/icons-material/Task';
import InsightsIcon from '@mui/icons-material/Insights';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';

const items = [
  {
    icon: <ViewQuiltRoundedIcon />,
    title: 'Dashboard',
    description:
      'Muestra los avances de los habitos y tareas que has completado',
    imageLight: url("${DashboardLight}"),
    imageDark: url("${Dashboard}"),
  },
  {
    icon: <InsightsIcon />,
    title: 'Habit Tracker',
    description:
      'Realiza un seguimiento de tus hábitos diarios y observa tu progreso a lo largo del tiempo.',
    imageLight: url("${habitPageLight}"),
    imageDark: url("${habitPageImg}"),
  },
  {
    icon: <TaskIcon />,
    title: 'Task Manager',
    description:
      'Organiza y prioriza tus tareas diarias con facilidad.',
    imageLight: url("${TaskmanagerLight}"),
    imageDark: url("${Taskmanager}"),
  },
];

const Chip = styled(MuiChip)(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        borderColor: (theme.vars || theme).palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

function MobileLayout({ selectedItemIndex, handleItemClick, selectedFeature }) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            minHeight: 500,
            backgroundImage: 'var(--items-imageLight)',
            ...theme.applyStyles('dark', {
              backgroundImage: 'var(--items-imageDark)',
            }),

          })}
          style={
            items[selectedItemIndex]
              ? {
                '--items-imageLight': items[selectedItemIndex].imageLight,
                '--items-imageDark': items[selectedItemIndex].imageDark,
              }
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 'medium' }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

MobileLayout.propTypes = {
  handleItemClick: PropTypes.func.isRequired,
  selectedFeature: PropTypes.shape({
    description: PropTypes.string.isRequired,
    icon: PropTypes.element,
    imageDark: PropTypes.string.isRequired,
    imageLight: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  selectedItemIndex: PropTypes.number.isRequired,
};

export { MobileLayout };

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);
  // Definimos la constante para el intervalo de cambio (5 segundos)
  const AUTOPLAY_INTERVAL = 5000; 
  const totalItems = items.length;

  const handleItemClick = (index) => {
    setSelectedItemIndex(index);
  };

  // LÓGICA DE CARRUSEL AUTOMÁTICO
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Cambiar al siguiente índice: (índice actual + 1) % número total de ítems
      setSelectedItemIndex((prevIndex) => (prevIndex + 1) % totalItems);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [totalItems]); 

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography
          component="h1"
          variant="h3"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          Características
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 }, fontSize: 18 }}
        >
          Descubre las características que hacen que nuestro planificador de hábitos y tareas sea la herramienta definitiva para transformar tu productividad y alcanzar tus metas diarias.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: 2,
        }}
      >
        <div>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: '100%',
                    width: '100%',
                    '&:hover': {
                      backgroundColor: (theme.vars || theme).palette.action.hover,
                    },
                  }),
                  selectedItemIndex === index && {
                    backgroundColor: 'action.selected',
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'left',
                      gap: 1,
                      textAlign: 'left',
                      textTransform: 'none',
                      color: 'text.secondary',
                    },
                    selectedItemIndex === index && {
                      color: 'text.primary',
                    },
                  ]}
                >
                  {icon}

                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <MobileLayout
            selectedItemIndex={selectedItemIndex}
            handleItemClick={handleItemClick}
            selectedFeature={selectedFeature}
          />
        </div>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: { xs: '100%', md: '70%' },
            height: 'var(--items-image-height)', 
          }}
        >
          <GlowCard 
            component={Card} 
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            <Box
              sx={(theme) => ({
                m: 'auto',
                width: 630,
                height: 750,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'center', 
                backgroundImage: 'var(--items-imageLight)',
                ...theme.applyStyles('dark', {
                  backgroundImage: 'var(--items-imageDark)',
                }),
              })}
              style={
                items[selectedItemIndex]
                  ? {
                    '--items-imageLight': items[selectedItemIndex].imageLight,
                    '--items-imageDark': items[selectedItemIndex].imageDark,
                  }
                  : {}
              }
            />
          </GlowCard>
        </Box>
      </Box>
    </Container>
  );
}4