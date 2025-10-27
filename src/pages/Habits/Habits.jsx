import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container, Typography, Fab, List, Card, CardContent, Chip,
    IconButton, Modal, TextField, Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
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
} from '../DashboardPage/theme/customizations';
import Header from '../../globalComponents/Header';


// --- Combinando las personalizaciones del tema ---
export const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

// Helper para headers con token
const getAuthHeaders = (withJson = false) => {
    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
};

// Estilo del modal
const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4,
};

function HabitsPage(props) {
    const location = useLocation();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    // Aseguramos que los nuevos campos estén presentes en el estado
    const [currentHabit, setCurrentHabit] = useState({ id: null, title: '', streak: 0, lastCompleted: null, time: '', location: '' });

    // --- Detectar si viene de búsqueda y abrir modal ---
    useEffect(() => {
        if (location.state?.openEditModal && location.state?.habit) {
            handleOpenModal(location.state.habit);
            // Limpiar el state para que no se abra de nuevo al recargar
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // --- Lógica para cargar hábitos (Fetch) ---
    useEffect(() => {
        const fetchHabits = async () => {

            const token = localStorage.getItem('token');

            if (!token) {
                setError('Error: Debes iniciar sesión para ver tus hábitos.');
                setLoading(false);
                return;
            }

            try {
                // El backend ahora devuelve 'streak' y 'lastCompleted'
                const response = await fetch('http://localhost:5000/api/habits', {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Error al cargar los hábitos');
                }
                const data = await response.json();
                setHabits(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHabits();
    }, []);

    // --- Lógica del Modal (Open/Close/Change) ---
    const handleOpenModal = (habit = null) => {
        // Aseguramos que el estado inicial tenga 'streak' y 'lastCompleted'
        const initialHabit = habit
            ? { ...habit }
            : { id: null, title: '', streak: 0, lastCompleted: null, time: '', location: '' };

        setCurrentHabit(initialHabit);
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

    // --- Operaciones CRUD (Create/Update/Delete/Checkin) ---
    const handleSaveHabit = async () => {
        try {
            const url = currentHabit.id
                ? `/api/habits/${currentHabit.id}`
                : '/api/habits';
            const method = currentHabit.id ? 'PUT' : 'POST';

            const response = await fetch(`http://localhost:5000${url}`, {
                method: method,
                headers: getAuthHeaders(true),
                body: JSON.stringify(currentHabit),
            });

            if (!response.ok) {
                throw new Error(`Error al ${currentHabit.id ? 'actualizar' : 'crear'} el hábito`);
            }

            const savedHabit = await response.json();

            // Si es PUT, el backend solo devuelve title/time/location.
            // Mantenemos la racha y lastCompleted que ya teníamos en el frontend.
            const updatedHabitData = currentHabit.id
                ? { ...savedHabit, streak: currentHabit.streak, lastCompleted: currentHabit.lastCompleted }
                : savedHabit; // Si es POST, el backend ya devuelve streak: 0 y lastCompleted: null

            if (currentHabit.id) {
                setHabits(habits.map(h => h.id === updatedHabitData.id ? updatedHabitData : h));
            } else {
                setHabits([...habits, updatedHabitData]);
            }

            handleCloseModal();
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleDeleteHabit = async (habitId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/habits/${habitId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el hábito');
            }

            setHabits(habits.filter(h => h.id !== habitId));

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // --- FUNCIÓN MODIFICADA PARA LA RACHA ---
    const handleCheckIn = async (habitId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/habits/${habitId}/checkin`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Error al registrar el hábito');
            }

            // El backend ahora devuelve el objeto de hábito COMPLETO con streak y lastCompleted actualizados
            const updatedHabit = await response.json();

            setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // --- Helpers de UI ---
    // MODIFICADO para usar comparación de cadenas YYYY-MM-DD
    const isCompletedToday = (lastCompletedDate) => {
        if (!lastCompletedDate) return false;

        // Formatear la fecha actual a YYYY-MM-DD
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;

        // lastCompletedDate debe venir como 'YYYY-MM-DD' del backend para esta comparación
        return todayString === lastCompletedDate.substring(0, 10);
    };

const isStreakInDanger = (habit) => {
        // 1. Si no hay fecha o si se completó hoy, no hay peligro.
        if (!habit.lastCompleted || isCompletedToday(habit.lastCompleted)) {
            return false;
        }

        // 2. Formatear la fecha de AYER a YYYY-MM-DD (de forma segura).
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yyyy = yesterday.getFullYear();
        const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
        const dd = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayString = `${yyyy}-${mm}-${dd}`;
        
        // 3. Comparar la fecha de AYER con la última fecha completada.
        // El habit.lastCompleted viene del backend como 'YYYY-MM-DD' o similar.
        // Usamos substring(0, 10) para asegurar que solo comparamos la fecha.
        return yesterdayString === habit.lastCompleted.substring(0, 10);
    };

    if (loading) {}
    if (error) {}

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)` : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                    })}
                >
                    <Header />
                    <Container maxWidth="lg" sx={{ pt: 2, pb: 5 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Mis Hábitos
                        </Typography>

                        <List>
                            {habits.map((habit) => {
                                // Los campos streak y lastCompleted ahora vienen del servidor
                                const completed = isCompletedToday(habit.lastCompleted);
                                const inDanger = isStreakInDanger(habit);

                                return (
                                    <Box key={habit.id} sx={{ mb: 2 }}>
                                        {inDanger && (
                                            <Typography variant="body2" fontWeight="bold" color="warning.main" sx={{ ml: 1, mb: 0.5 }}>
                                                ! Racha en Peligro
                                            </Typography>
                                        )}
                                        <Card sx={{
                                            border: 2,
                                            borderColor: inDanger ? 'warning.main' : 'transparent',
                                        }}>
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: '12px !important' }}>
                                                <IconButton
                                                    onClick={() => handleCheckIn(habit.id)}
                                                    color={completed ? 'success' : 'default'}
                                                    sx={{ mr: 1 }}
                                                >
                                                    {completed ? <CheckCircleIcon sx={{ fontSize: 48 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 48 }} />}
                                                </IconButton>
                                                <Typography variant="h6" component="div" sx={{ flexGrow: 1, pl: 3, fontSize: '1.45rem' }}>
                                                    {habit.title}
                                                </Typography>
                                                <Chip
                                                    icon={<LocalFireDepartmentIcon sx={{ fontSize: 24 }} />}
                                                    // Usamos habit.streak que ahora viene del backend
                                                    label={`${habit.streak || 0} días`}
                                                    variant="outlined"
                                                    color={completed ? 'success' : 'default'}
                                                    sx={{ mr: 1, fontWeight: 'bold', height: 36, fontSize: '1rem' }}
                                                />
                                                <IconButton onClick={() => handleOpenModal(habit)}><EditIcon /></IconButton>
                                                <IconButton onClick={() => handleDeleteHabit(habit.id)}><DeleteIcon /></IconButton>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                );
                            })}
                        </List>

                        <Fab
                            variant="extended"
                            color="primary"
                            aria-label="agregar habito"
                            sx={{ position: 'fixed', bottom: 32, right: 32, }}
                            onClick={() => handleOpenModal()}
                        >
                            <AddIcon sx={{ mr: 1 }} />
                            Agregar Hábito
                        </Fab>

                        {currentHabit && (
                            <Modal open={openModal} onClose={handleCloseModal}>
                                <Box sx={modalStyle}>
                                    <Typography variant="h6" component="h2">{currentHabit.id ? 'Editar Hábito' : 'Añadir Nuevo Hábito'}</Typography>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        name="title"
                                        label="Nombre del Hábito"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        value={currentHabit.title || ''}
                                        onChange={handleModalChange}
                                        sx={{ mt: 2 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                        <TextField name="time" label="Hora" type="time" fullWidth InputLabelProps={{ shrink: true }} value={currentHabit.time || ''} onChange={handleModalChange} />
                                        <TextField name="location" label="Lugar" type="text" fullWidth value={currentHabit.location || ''} onChange={handleModalChange} />
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