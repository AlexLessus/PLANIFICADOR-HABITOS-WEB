import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import HighlightedCard from './HighlightedCard';

// Importar las nuevas tarjetas de estadísticas
import TasksTodayCard from './stats/TasksTodayCard';
import ActiveHabitsCard from './stats/ActiveHabitsCard';
import CurrentStreakCard from './stats/CurrentStreakCard';
import NextTaskCard from './stats/NextTaskCard';

// Importar componentes de tareas
import UpcomingTasksList from './tasks/UpcomingTasksList';

// Importar componentes de hábitos
import TodayHabitsPanel from './habits/TodayHabitsPanel';
import HabitsProgressChart from './habits/HabitsProgressChart';

// Importar componentes de estadísticas
import MonthlyStats from './statistics/MonthlyStats';

// const data = [
//   {
//     title: 'Users',
//     value: '14k',
//     interval: 'Last 30 days',
//     trend: 'up',
//     data: [
//       200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
//       360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
//     ],
//   },
//   {
//     title: 'Conversions',
//     value: '325',
//     interval: 'Last 30 days',
//     trend: 'down',
//     data: [
//       1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820,
//       780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300, 220,
//     ],
//   },
//   {
//     title: 'Event count',
//     value: '200k',
//     interval: 'Last 30 days',
//     trend: 'neutral',
//     data: [
//       500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530,
//       520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
//     ],
//   },
// ];

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Resumen
      </Typography>
      <Grid container spacing={2} >
        {/* Tarjetas de estadísticas */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TasksTodayCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ActiveHabitsCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CurrentStreakCard />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <NextTaskCard />
        </Grid>
      </Grid>

      {/* Sección de tareas y hábitos */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Lista de tareas próximas */}
          <UpcomingTasksList />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Panel de hábitos de hoy */}
          <TodayHabitsPanel />
        </Grid>
      </Grid>

      {/* Sección de gráficos y estadísticas */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Gráfico de progreso de hábitos */}
          <HabitsProgressChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Estadísticas mensuales */}
          <MonthlyStats />
        </Grid>
      </Grid>


      {/*
      Grid para mostrar las tarjetas de estadísticas y gráficos
      <Grid 
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>*/}
      {/*}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Details
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <CustomizedTreeView />
            <ChartUserByCountry />
          </Stack>
        </Grid>
      </Grid>
      */}
    </Box>
  );
}
