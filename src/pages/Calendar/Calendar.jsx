import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
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
    CircularProgress,
    IconButton,
    List,
    Card,
    CardContent
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import CssBaseline from '@mui/material/CssBaseline';

// --- Layout y Tema ---
import MainLayout from '../../globalComponents/MainLayout';
import Header from '../../globalComponents/Header';
import AppTheme from '../../shared-theme/AppTheme';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';

// --- Componentes del Calendario ---
import EditTaskModal from './components/EditTaskModal';

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
    taskCompleted: '#31dd1eff', // Gris para tareas completadas
    habit: '#1de0e7ff'     // Verde para hábitos
};

// Estilo para el modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#5c5a5a72',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};


function CalendarPage(props) {
    const [events, setEvents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'tasks', 'habits'
    
    // Estado para la tarea en edición
    const [editingTask, setEditingTask] = useState({
        id: null,
        title: '',
        description: '',
        priority: 'Media',
        due_date: null,
        status: 'Pendiente'
    });
    
    // Estado para vista de día completo
    const [openDayViewModal, setOpenDayViewModal] = useState(false);
    const [selectedDayTasks, setSelectedDayTasks] = useState([]);
    const [selectedDayDate, setSelectedDayDate] = useState(null);

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
            
            if (tasksRes.status === 401 || tasksRes.status === 403) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                setLoading(false);
                return;
            }
            
            if (!tasksRes.ok) {
                throw new Error(`Error al cargar tareas: ${tasksRes.status}`);
            }
            const tasks = await tasksRes.json();

            // 2. Obtener hábitos completados
            const habitsRes = await fetch('http://localhost:5000/api/habits/completions', {
                headers: getAuthHeaders()
            });
            
            if (habitsRes.status === 401 || habitsRes.status === 403) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                setLoading(false);
                return;
            }
            
            if (!habitsRes.ok) {
                console.warn('No se pudieron cargar los hábitos completados');
                // Continuar solo con tareas si los hábitos fallan
                const taskEvents = transformTasksToEvents(tasks);
                setEvents(taskEvents);
                setLoading(false);
                return;
            }
            const habitCompletions = await habitsRes.json();

            // 3. Transformar a formato FullCalendar
            const taskEvents = transformTasksToEvents(tasks);
            const habitEvents = transformHabitsToEvents(habitCompletions);
            
            setEvents([...taskEvents, ...habitEvents]);
        } catch (err) {
            console.error('Error cargando datos del calendario:', err);
            setError(err.message || 'Error al cargar los datos del calendario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, []);

    // --- Manejadores de Eventos del Calendario ---
    const handleDateClick = (arg) => {
        console.log('=== DEBUG handleDateClick ===');
        console.log('Fecha clickeada:', arg.dateStr);
        console.log('Total eventos:', events.length);
        
        // Obtener todas las tareas de ese día
        const tasksForDay = events.filter(event => {
            // Extraer solo la parte de fecha (YYYY-MM-DD) del evento
            const eventDate = event.date ? event.date.split('T')[0] : null;
            console.log('Comparando:', eventDate, '===', arg.dateStr, '?', eventDate === arg.dateStr);
            return eventDate === arg.dateStr && event.extendedProps?.type === 'task';
        });
        
        console.log('Tareas encontradas para', arg.dateStr, ':', tasksForDay.length);
        console.log('Tareas:', tasksForDay);
        
        if (tasksForDay.length >= 2) {
            // Si hay 2 o más tareas, mostrar vista de día completo
            console.log('✅ Abriendo modal de vista diaria');
            setSelectedDayTasks(tasksForDay);
            setSelectedDayDate(arg.dateStr);
            setOpenDayViewModal(true);
        } else {
            // Si hay 0 o 1 tarea, abrir modal de añadir rápida
            console.log('📝 Abriendo modal de añadir rápida');
            setSelectedDate(arg.dateStr);
            setOpenModal(true);
        }
    };

    const handleEventClick = (clickInfo) => {
        const { type, taskId, priority, status, description, time, location } = clickInfo.event.extendedProps;
        
        if (type === 'task') {
            // Abrir modal de edición para tareas
            const dateStr = clickInfo.event.start.toISOString().split('T')[0];
            setEditingTask({
                id: taskId,
                title: clickInfo.event.title.replace('✓ ', ''),
                description: description || '',
                priority: priority,
                due_date: new Date(dateStr),
                status: status
            });
            setOpenEditModal(true);
        } else if (type === 'habit') {
            // Mostrar información del hábito (solo lectura)
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

    // --- Lógica del Modal de Edición ---
    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setEditingTask({
            id: null,
            title: '',
            description: '',
            priority: 'Media',
            due_date: null,
            status: 'Pendiente'
        });
    };

    const handleEditTaskChange = (e) => {
        setEditingTask(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditDateChange = (newDate) => {
        setEditingTask(prev => ({ ...prev, due_date: newDate }));
    };

    const handleUpdateTask = async () => {
        if (!editingTask.title.trim()) {
            alert('El título de la tarea es obligatorio');
            return;
        }

        try {
            const dueDateString = editingTask.due_date instanceof Date && !isNaN(editingTask.due_date)
                ? editingTask.due_date.toISOString().split('T')[0]
                : null;

            const response = await fetch(`http://localhost:5000/api/tasks/${editingTask.id}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: editingTask.title,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    due_date: dueDateString,
                    status: editingTask.status
                })
            });

            if (!response.ok) throw new Error('Error al actualizar la tarea');
            
            // Recargar eventos del calendario
            await fetchCalendarData();
            handleCloseEditModal();
        } catch (err) {
            console.error('Error al actualizar tarea:', err);
            alert('Error al actualizar la tarea. Inténtalo de nuevo.');
        }
    };

    const handleDeleteTask = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${editingTask.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) throw new Error('Error al eliminar la tarea');
            
            // Recargar eventos del calendario
            await fetchCalendarData();
            handleCloseEditModal();
        } catch (err) {
            console.error('Error al eliminar tarea:', err);
            alert('Error al eliminar la tarea. Inténtalo de nuevo.');
        }
    };

    // --- Lógica del Modal de Vista Diaria ---
    const handleCloseDayViewModal = () => {
        setOpenDayViewModal(false);
        setSelectedDayTasks([]);
        setSelectedDayDate(null);
    };

    const handleOpenTaskFromDayView = (task) => {
        // Cerrar modal de vista diaria y abrir modal de edición
        handleCloseDayViewModal();
        setEditingTask({
            id: task.extendedProps.taskId,
            title: task.title.replace('✓ ', ''),
            description: task.extendedProps.description || '',
            priority: task.extendedProps.priority,
            due_date: new Date(task.date),
            status: task.extendedProps.status
        });
        setOpenEditModal(true);
    };

    const handleAddTaskFromDayView = () => {
        // Cerrar modal de vista diaria y abrir modal de añadir
        handleCloseDayViewModal();
        setSelectedDate(selectedDayDate);
        setOpenModal(true);
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
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        backgroundColor: 'background.default',
                        overflow: 'auto',
                    }}
                >
                    <Header />
                    <Container maxWidth="xl" sx={{ pt: 2, pb: 3 }}>
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
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
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
                            // Limitar eventos mostrados por día
                            dayMaxEvents={2}
                            moreLinkClick="popover"
                            moreLinkText={(num) => `+${num} más`}
                            // Mejorar visualización
                            eventDisplay="block"
                            displayEventTime={false}
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

                    {/* Modal para editar tarea */}
                    <EditTaskModal
                        open={openEditModal}
                        onClose={handleCloseEditModal}
                        task={editingTask}
                        onTaskChange={handleEditTaskChange}
                        onDateChange={handleEditDateChange}
                        onUpdate={handleUpdateTask}
                        onDelete={handleDeleteTask}
                    />

                    {/* Modal de Vista Diaria - Muestra todas las tareas del día */}
                    <Dialog 
                        open={openDayViewModal} 
                        onClose={handleCloseDayViewModal}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6">
                                        📅 Tareas del {selectedDayDate && new Date(selectedDayDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'tarea' : 'tareas'}
                                    </Typography>
                                </Box>
                                <Button 
                                    variant="contained" 
                                    size="small"
                                    onClick={handleAddTaskFromDayView}
                                    startIcon={<AddCircleIcon />}
                                >
                                    Nueva Tarea
                                </Button>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <List>
                                {selectedDayTasks.map((task, index) => (
                                    <Card 
                                        key={task.id} 
                                        sx={{ 
                                            mb: 1.5,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                boxShadow: 3,
                                                transform: 'translateY(-2px)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                        onClick={() => handleOpenTaskFromDayView(task)}
                                    >
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                                            {/* Indicador de color por prioridad */}
                                            <Box 
                                                sx={{ 
                                                    width: 4, 
                                                    height: 40, 
                                                    bgcolor: task.color,
                                                    borderRadius: 1
                                                }} 
                                            />
                                            
                                            {/* Contenido de la tarea */}
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography 
                                                    variant="body1" 
                                                    fontWeight="bold"
                                                    sx={{ 
                                                        textDecoration: task.extendedProps.status === 'Completada' ? 'line-through' : 'none'
                                                    }}
                                                >
                                                    {task.title}
                                                </Typography>
                                                {task.extendedProps.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {task.extendedProps.description}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Chips de estado y prioridad */}
                                            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                                <Chip 
                                                    label={task.extendedProps.priority} 
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: task.color,
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                                {task.extendedProps.status === 'Completada' && (
                                                    <Chip 
                                                        label="✓ Completada" 
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>

                                            {/* Ícono de editar */}
                                            <IconButton 
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenTaskFromDayView(task);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </CardContent>
                                    </Card>
                                ))}
                            </List>

                            {selectedDayTasks.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No hay tareas para este día
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        sx={{ mt: 2 }}
                                        onClick={handleAddTaskFromDayView}
                                    >
                                        Añadir Primera Tarea
                                    </Button>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDayViewModal}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>
                </Container>
                </Box>
            </Box>
        </AppTheme>
    );
}

export default CalendarPage;
