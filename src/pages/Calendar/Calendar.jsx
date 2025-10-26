import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Modal,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    Alert,
    CircularProgress
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// --- Layout y Tema ---
import MainLayout from '../../globalComponents/MainLayout';
import Header from '../../globalComponents/Header';
import AppTheme from '../../shared-theme/AppTheme';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';

// --- Componentes de FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // para clics

const xThemeComponents = { ...chartsCustomizations, ...dataGridCustomizations, ...datePickersCustomizations, ...treeViewCustomizations };

// Helper para headers con token
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Colores para diferentes tipos de eventos
const COLORS = {
    task: {
        alta: '#f44336',    // Rojo
        media: '#ff9800',   // Naranja
        baja: '#2196f3'     // Azul
    },
    taskCompleted: '#9e9e9e', // Gris para tareas completadas
    habit: '#4caf50'     // Verde para hábitos
};

// Estilo para el modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};


function CalendarPage(props) {
    const [events, setEvents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'tasks', 'habits'

    // --- Funciones de Transformación de Datos ---
    const getTaskColor = (priority, status) => {
        if (status === 'Completada') return COLORS.taskCompleted;
        return COLORS.task[priority?.toLowerCase()] || COLORS.task.media;
    };

    const transformTasksToEvents = (tasks) => {
        return tasks
            .filter(task => task.due_date) // Solo tareas con fecha
            .map(task => ({
                id: `task-${task.id}`,
                title: task.status === 'Completada' ? `✓ ${task.title}` : task.title,
                date: task.due_date,
                color: getTaskColor(task.priority, task.status),
                extendedProps: { 
                    type: 'task',
                    taskId: task.id,
                    priority: task.priority,
                    status: task.status,
                    description: task.description
                }
            }));
    };

    const transformHabitsToEvents = (completions) => {
        return completions.map(completion => ({
            id: `habit-${completion.habit_id}-${completion.completion_date}`,
            title: `✓ ${completion.title}`,
            date: completion.completion_date,
            display: 'background',
            color: COLORS.habit,
            extendedProps: {
                type: 'habit',
                habitId: completion.habit_id,
                time: completion.time,
                location: completion.location
            }
        }));
    };

    // --- Carga de Datos del Backend ---
    const fetchCalendarData = async () => {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Debes iniciar sesión para ver el calendario.');
            setLoading(false);
            return;
        }

        try {
            // 1. Obtener tareas
            const tasksRes = await fetch('http://localhost:5000/api/tasks', {
                headers: getAuthHeaders()
            });
            
            if (!tasksRes.ok) throw new Error('Error al cargar tareas');
            const tasks = await tasksRes.json();

            // 2. Obtener hábitos completados
            const habitsRes = await fetch('http://localhost:5000/api/habits/completions', {
                headers: getAuthHeaders()
            });
            
            if (!habitsRes.ok) throw new Error('Error al cargar hábitos');
            const habitCompletions = await habitsRes.json();

            // 3. Transformar a formato FullCalendar
            const taskEvents = transformTasksToEvents(tasks);
            const habitEvents = transformHabitsToEvents(habitCompletions);
            
            setEvents([...taskEvents, ...habitEvents]);
        } catch (err) {
            console.error('Error cargando datos del calendario:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, []);

    // --- Manejadores de Eventos del Calendario ---
    const handleDateClick = (arg) => {
        setSelectedDate(arg.dateStr);
        setOpenModal(true);
    };

    const handleEventClick = (clickInfo) => {
        const { type, priority, status, description, time, location } = clickInfo.event.extendedProps;
        
        if (type === 'task') {
            const details = [
                `📋 Tarea: ${clickInfo.event.title}`,
                `📅 Fecha: ${clickInfo.event.start.toLocaleDateString('es-ES')}`,
                `⚡ Prioridad: ${priority}`,
                `📊 Estado: ${status}`,
                description ? `📝 Descripción: ${description}` : ''
            ].filter(Boolean).join('\n');
            
            alert(details);
        } else if (type === 'habit') {
            const details = [
                `✅ Hábito completado: ${clickInfo.event.title.replace('✓ ', '')}`,
                `📅 Fecha: ${clickInfo.event.start.toLocaleDateString('es-ES')}`,
                time ? `🕐 Hora: ${time}` : '',
                location ? `📍 Lugar: ${location}` : ''
            ].filter(Boolean).join('\n');
            
            alert(details);
        }
    };

    // --- Lógica del Modal para Añadir Tarea ---
    const handleCloseModal = () => {
        setOpenModal(false);
        setNewTaskTitle('');
        setSelectedDate(null);
    };

    const handleAddTask = async () => {
        if (newTaskTitle.trim() && selectedDate) {
            try {
                const response = await fetch('http://localhost:5000/api/tasks', {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: newTaskTitle,
                        description: '',
                        priority: 'Media',
                        due_date: selectedDate,
                        status: 'Pendiente'
                    })
                });

                if (!response.ok) throw new Error('Error al crear la tarea');
                
                // Recargar eventos del calendario
                await fetchCalendarData();
                handleCloseModal();
            } catch (err) {
                console.error('Error al añadir tarea:', err);
                alert('Error al añadir la tarea. Inténtalo de nuevo.');
            }
        }
    };

    // --- Filtrado de Eventos ---
    const filteredEvents = events.filter(event => {
        if (filter === 'all') return true;
        if (filter === 'tasks') return event.extendedProps.type === 'task';
        if (filter === 'habits') return event.extendedProps.type === 'habit';
        return true;
    });

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Header />
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Container maxWidth="xl" sx={{ marginTop: 0, flexGrow: 1, padding: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Calendario
                    </Typography>

                    {/* Leyenda de Colores */}
                    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold' }}>Leyenda:</Typography>
                        <Chip label="Alta Prioridad" size="small" sx={{ bgcolor: COLORS.task.alta, color: 'white' }} />
                        <Chip label="Media Prioridad" size="small" sx={{ bgcolor: COLORS.task.media, color: 'white' }} />
                        <Chip label="Baja Prioridad" size="small" sx={{ bgcolor: COLORS.task.baja, color: 'white' }} />
                        <Chip label="Completada" size="small" sx={{ bgcolor: COLORS.taskCompleted, color: 'white' }} />
                        <Chip label="Hábito Completado" size="small" sx={{ bgcolor: COLORS.habit, color: 'white' }} />
                    </Box>

                    {/* Filtros */}
                    <Box sx={{ mb: 2 }}>
                        <ToggleButtonGroup
                            color="primary"
                            value={filter}
                            exclusive
                            onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
                            size="small"
                        >
                            <ToggleButton value="all">Todos</ToggleButton>
                            <ToggleButton value="tasks">Tareas</ToggleButton>
                            <ToggleButton value="habits">Hábitos</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Mensajes de Error */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                    <Paper sx={{ p: 2 }}>
                        <FullCalendar
                            // CAMBIO 1: Elimina 'materialV5Plugin' del arreglo
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            // CAMBIO 2: Cambia 'material-v5' a simplemente 'material'
                            themeSystem="material"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,dayGridWeek'
                            }}
                            events={filteredEvents}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            locale="es"
                            buttonText={{
                                today: 'Hoy',
                                month: 'Mes',
                                week: 'Semana',
                            }}
                            height="80vh"
                        />
                    </Paper>
                    )}

                    {/* Modal para añadir tarea rápida */}
                    <Dialog open={openModal} onClose={handleCloseModal}>
                        <DialogTitle>Añadir Tarea Rápida</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Título de la tarea"
                                fullWidth
                                variant="outlined"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Fecha seleccionada: {selectedDate}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseModal}>Cancelar</Button>
                            <Button onClick={handleAddTask} variant="contained">Añadir</Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
        </AppTheme>
    );
}

export default CalendarPage;
