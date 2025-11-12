import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Typography, Fab, List, Card, CardContent, Chip,
    IconButton, Modal, TextField, Button, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import Box from '@mui/material/Box';
import { PageLayout } from '../../components';
import API_URL from '../../config/api';
import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../DashboardPage/theme/customizations';

const COLOR_HABIT_DEFAULT = '#FF9800';
const COLOR_HABIT_IN_DANGER = '#FF5722';
const COLOR_HABIT_SAFE = '#4CAF50';

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

// Estilo del modal responsive
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500, md: 600 },
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: { xs: 2, md: 3 },
    boxShadow: 24,
    p: { xs: 3, sm: 4 },
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
                const response = await fetch(`${API_URL}/api/habits`, {
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

            const response = await fetch(`${API_URL}${url}`, {
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
            const response = await fetch(`${API_URL}/api/habits/${habitId}`, {
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
            const response = await fetch(`${API_URL}/api/habits/${habitId}/checkin`, {
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

    if (loading) { }
    if (error) { }

    return (
        <PageLayout themeComponents={xThemeComponents} {...props}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                    fontWeight: 600,
                    mb: { xs: 2, md: 3 },
                }}
            >
                Mis Hábitos
            </Typography>

            <List sx={{ width: '100%' }}>
                {habits.map((habit) => {
                    const completed = isCompletedToday(habit.lastCompleted);
                    const inDanger = isStreakInDanger(habit);

                    return (
                        <Box key={habit.id} sx={{ mb: { xs: 1.5, md: 2 } }}>
                            {inDanger && (
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={COLOR_HABIT_IN_DANGER}
                                    sx={{ ml: 1, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    ¡Completa hoy para mantener tu racha!
                                </Typography>
                            )}
                            <Card
                                sx={{
                                    borderLeft: { xs: '4px solid', md: '6px solid' },
                                    borderLeftColor: !habit.lastCompleted
                                        ? COLOR_HABIT_DEFAULT
                                        : inDanger
                                        ? COLOR_HABIT_IN_DANGER
                                        : COLOR_HABIT_SAFE,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3,
                                    },
                                }}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        gap: { xs: 1.5, sm: 2 },
                                        p: { xs: 2, sm: '12px' },
                                        '&:last-child': { pb: { xs: 2, sm: '12px' } },
                                    }}
                                >
                                    {/* Botón de Check */}
                                    <IconButton
                                        onClick={() => handleCheckIn(habit.id)}
                                        color={completed ? 'success' : 'default'}
                                        sx={{
                                            alignSelf: { xs: 'center', sm: 'auto' },
                                            minWidth: 44,
                                            minHeight: 44,
                                        }}
                                    >
                                        {completed ? (
                                            <CheckCircleIcon sx={{ fontSize: { xs: 40, sm: 48, md: 53 } }} />
                                        ) : (
                                            <RadioButtonUncheckedIcon sx={{ fontSize: { xs: 40, sm: 48, md: 53 } }} />
                                        )}
                                    </IconButton>

                                    {/* Título */}
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{
                                            flexGrow: 1,
                                            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.45rem' },
                                            textAlign: { xs: 'center', sm: 'left' },
                                            pl: { xs: 0, sm: 3 },
                                        }}
                                    >
                                        {habit.title}
                                    </Typography>

                                    {/* Chip de Racha */}
                                    <Chip
                                        icon={<LocalFireDepartmentIcon sx={{ fontSize: { xs: 20, md: 24 } }} />}
                                        label={`${habit.streak || 0} días`}
                                        variant="outlined"
                                        color={completed ? 'success' : 'default'}
                                        sx={{
                                            fontWeight: 'bold',
                                            height: { xs: 32, md: 36 },
                                            fontSize: { xs: '0.875rem', md: '1rem' },
                                            alignSelf: { xs: 'center', sm: 'auto' },
                                        }}
                                    />

                                    {/* Botones de Acción */}
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}
                                    >
                                        <IconButton
                                            onClick={() => handleOpenModal(habit)}
                                            sx={{ minWidth: 44, minHeight: 44 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteHabit(habit.id)}
                                            sx={{ minWidth: 44, minHeight: 44 }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </List>

            {/* FAB Responsive */}
            <Fab
                variant="extended"
                color="primary"
                aria-label="agregar habito"
                sx={{
                    position: 'fixed',
                    bottom: { xs: 16, sm: 24, md: 32 },
                    right: { xs: 16, sm: 24, md: 32 },
                    minHeight: 48,
                    px: { xs: 2, sm: 3 },
                }}
                onClick={() => handleOpenModal()}
            >
                <AddIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                <Box
                    component="span"
                    sx={{ display: { xs: 'none', sm: 'inline' } }}
                >
                    Agregar Hábito
                </Box>
            </Fab>

            {/* Modal Responsive */}
            {currentHabit && (
                <Modal open={openModal} onClose={handleCloseModal}>
                    <Box sx={modalStyle}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                                mb: 2,
                            }}
                        >
                            {currentHabit.id ? 'Editar Hábito' : 'Añadir Nuevo Hábito'}
                        </Typography>

                        <Stack spacing={{ xs: 2, sm: 2.5 }}>
                            <TextField
                                autoFocus
                                name="title"
                                label="Nombre del Hábito"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={currentHabit.title || ''}
                                onChange={handleModalChange}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        minHeight: 44,
                                    },
                                }}
                            />

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    name="time"
                                    label="Hora"
                                    type="time"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={currentHabit.time || ''}
                                    onChange={handleModalChange}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            minHeight: 44,
                                        },
                                    }}
                                />
                                <TextField
                                    name="location"
                                    label="Lugar"
                                    type="text"
                                    fullWidth
                                    value={currentHabit.location || ''}
                                    onChange={handleModalChange}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            minHeight: 44,
                                        },
                                    }}
                                />
                            </Box>

                            <Stack
                                direction={{ xs: 'column-reverse', sm: 'row' }}
                                spacing={1}
                                sx={{ justifyContent: 'flex-end', mt: 1 }}
                            >
                                <Button
                                    onClick={handleCloseModal}
                                    fullWidth={{ xs: true, sm: false }}
                                    sx={{ minHeight: 44 }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSaveHabit}
                                    fullWidth={{ xs: true, sm: false }}
                                    sx={{ minHeight: 44 }}
                                >
                                    Guardar
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Modal>
            )}
        </PageLayout>
    );
}

export default HabitsPage;