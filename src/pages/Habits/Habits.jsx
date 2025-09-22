import React, { useState } from 'react';
import {
    Container, Typography, Fab, List, Card, CardContent, ListItemIcon, Checkbox,
    ListItemText, IconButton, Modal, TextField, Button
} from '@mui/material';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MainLayout from '../../globalComponents/MainLayout';
import AppTheme from '../../shared-theme/AppTheme';
import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../DashboardPage/theme/customizations'; // Ajusta esta ruta si es necesario
import Header from '../../globalComponents/Header';

// --- NUEVO: Combinando las personalizaciones del tema ---
export const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

// El estilo del modal se mantiene igual
const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4,
};

function HabitsPage(props) {
    // --- Toda la lógica de la página de hábitos se mantiene intacta ---
    const [habits, setHabits] = useState([
        { id: 1, name: 'Leer 30 minutos', streak: 5, lastCompleted: new Date('2025-09-19'), time: '22:00', location: 'En la sala' },
        { id: 2, name: 'Hacer ejercicio', streak: 15, lastCompleted: new Date('2025-09-20'), time: '07:00', location: 'Gimnasio' },
        { id: 3, name: 'Meditar 10 minutos', streak: 0, lastCompleted: null, time: '', location: '' },
    ]);
    const [openModal, setOpenModal] = useState(false);
    const [currentHabit, setCurrentHabit] = useState(null);

    const handleOpenModal = (habit = null) => {
        setCurrentHabit(habit ? { ...habit } : { id: null, name: '', streak: 0, lastCompleted: null, time: '', location: '' });
        setOpenModal(true);
    };
    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentHabit(null);
    };
    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setCurrentHabit(prev => ({ ...prev, [name]: value }));
    };
    const handleSaveHabit = () => {
        if (currentHabit.id) {
            setHabits(habits.map(h => h.id === currentHabit.id ? currentHabit : h));
        } else {
            const newHabit = { ...currentHabit, id: Date.now() };
            setHabits([...habits, newHabit]);
        }
        handleCloseModal();
    };
    const handleDeleteHabit = (habitId) => setHabits(habits.filter(h => h.id !== habitId));
    const handleCheckIn = (habitId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setHabits(habits.map(habit => {
            if (habit.id === habitId) {
                const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
                if (lastCompleted) lastCompleted.setHours(0, 0, 0, 0);
                if (lastCompleted && lastCompleted.getTime() === today.getTime()) return habit;
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                const newStreak = (lastCompleted && lastCompleted.getTime() === yesterday.getTime()) ? habit.streak + 1 : 1;
                return { ...habit, streak: newStreak, lastCompleted: new Date() };
            }
            return habit;
        }));
    };
    const isCompletedToday = (lastCompletedDate) => {
        if (!lastCompletedDate) return false;
        const today = new Date();
        const lastDate = new Date(lastCompletedDate);
        return today.toDateString() === lastDate.toDateString();
    };

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Header />
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)` : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                        height: '100vh', // Asegura que el contenedor principal ocupe toda la altura
                    })}
                >
                    {/* El contenedor del contenido ahora usa un padding consistente y el margen superior para la navbar */}
                    <Container maxWidth="lg" sx={{ pt: 5, pb: 5 }}>
                        {/* --- Aquí comienza el contenido específico de la página de hábitos --- */}

                        <Typography variant="h4" component="h1" gutterBottom>
                            Mis Hábitos
                        </Typography>

                        <List>
                            {habits.map((habit) => (
                                <Card key={habit.id} sx={{ marginBottom: 2 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox edge="start" checked={isCompletedToday(habit.lastCompleted)} onChange={() => handleCheckIn(habit.id)} />
                                            <ListItemText primary={habit.name} secondary={`Racha: ${habit.streak} días`} />
                                            <IconButton onClick={() => handleOpenModal(habit)}><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDeleteHabit(habit.id)}><DeleteIcon /></IconButton>
                                        </Box>
                                        <Stack spacing={1} sx={{ pl: 6, mt: 1 }}>
                                            {habit.time && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                                                    <Typography variant="body2" color="text.secondary">{habit.time}</Typography>
                                                </Box>
                                            )}
                                            {habit.location && (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                                                    <Typography variant="body2" color="text.secondary">{habit.location}</Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </List>

                        {/* --- El FAB y el Modal se mantienen igual --- */}
                        <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => handleOpenModal()}>
                            <AddIcon />
                        </Fab>

                        {currentHabit && (
                            <Modal open={openModal} onClose={handleCloseModal}>
                                <Box sx={modalStyle}>
                                    <Typography variant="h6" component="h2">{currentHabit.id ? 'Editar Hábito' : 'Añadir Nuevo Hábito'}</Typography>
                                    <TextField autoFocus margin="dense" name="name" label="Nombre del Hábito" type="text" fullWidth variant="outlined" value={currentHabit.name} onChange={handleModalChange} sx={{ mt: 2 }} />
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                        <TextField name="time" label="Hora" type="time" fullWidth InputLabelProps={{ shrink: true }} value={currentHabit.time} onChange={handleModalChange} />
                                        <TextField name="location" label="Lugar" type="text" fullWidth value={currentHabit.location} onChange={handleModalChange} />
                                    </Box>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Cancelar</Button>
                                        <Button variant="contained" onClick={handleSaveHabit}>Guardar</Button>
                                    </Box>
                                </Box>
                            </Modal>
                        )}
                    </Container>
                </Box>
            </Box>
        </AppTheme>
    );
}

export default HabitsPage;