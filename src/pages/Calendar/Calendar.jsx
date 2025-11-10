import React, { useState, useEffect } from 'react';
import {
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
    CardContent,
    Tooltip,
    Divider,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Layout y Componentes ---
import { PageLayout } from '../../components';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';

// --- Componentes del Calendario ---
import EditTaskModal from './components/EditTaskModal';

// --- Componentes de FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // para clics

// --- Helpers de API ---
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

const xThemeComponents = { ...chartsCustomizations, ...dataGridCustomizations, ...datePickersCustomizations, ...treeViewCustomizations };

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
const chipStyles = (bgColor, textColor) => ({
    bgcolor: bgColor,
    '& .MuiChip-label': {
        color: textColor,
        fontWeight: 500
    }
});
// Estilo para el modal responsive
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 450, md: 500 },
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: '#5c5a5a72',
    borderRadius: { xs: 2, md: 3 },
    boxShadow: 24,
    p: { xs: 3, sm: 4 },
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
    
    // Estados para visualización de hábitos
    const [habitStats, setHabitStats] = useState({}); // Estadísticas por día
    const [allHabits, setAllHabits] = useState([]); // Lista de todos los hábitos activos
    const [habitCompletionsByDay, setHabitCompletionsByDay] = useState({}); // Hábitos completados por día

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

    // Calcular estadísticas de hábitos por día
    const calculateHabitStats = (habits, completions) => {
        const stats = {};
        const completionsByDay = {};
        
        // Agrupar completions por fecha
        completions.forEach(completion => {
            const date = completion.completion_date;
            if (!completionsByDay[date]) {
                completionsByDay[date] = [];
            }
            completionsByDay[date].push(completion.habit_id);
        });
        
        // Calcular estadísticas para cada día
        const totalHabits = habits.length;
        
        Object.keys(completionsByDay).forEach(date => {
            const completed = completionsByDay[date].length;
            const percentage = totalHabits > 0 ? (completed / totalHabits) * 100 : 0;
            
            stats[date] = {
                completed,
                total: totalHabits,
                percentage: Math.round(percentage)
            };
        });
        
        setHabitCompletionsByDay(completionsByDay);
        return stats;
    };

    // Calcular racha de días consecutivos
    const calculateStreak = (habitStats) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = new Date(today);
        
        // Retroceder día por día hasta encontrar un día sin 100%
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const stats = habitStats[dateStr];
            
            if (stats && stats.percentage === 100) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    };

    // Obtener color según porcentaje
    const getHabitDayColor = (percentage) => {
        if (percentage === 100) return 'rgba(76, 175, 80, 0.15)';  // Verde claro
        if (percentage >= 50) return 'rgba(255, 193, 7, 0.15)';    // Amarillo claro
        if (percentage > 0) return 'rgba(244, 67, 54, 0.15)';      // Rojo claro
        return 'transparent';
    };

    // Generar contenido del tooltip con detalles de hábitos
    const getHabitTooltipContent = (dateStr) => {
        const stats = habitStats[dateStr];
        if (!stats) return null;

        const completedHabitIds = habitCompletionsByDay[dateStr] || [];
        
        return (
            <Box sx={{ p: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric',
                        month: 'long'
                    })}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {stats.completed}/{stats.total} hábitos ({stats.percentage}%)
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense sx={{ py: 0 }}>
                    {allHabits.map(habit => {
                        const isCompleted = completedHabitIds.includes(habit.id);
                        return (
                            <ListItem key={habit.id} sx={{ px: 0, py: 0.25 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    {isCompleted ? 
                                        <CheckCircleIcon color="success" fontSize="small" /> : 
                                        <CancelIcon color="error" fontSize="small" />
                                    }
                                </ListItemIcon>
                                <ListItemText 
                                    primary={habit.title}
                                    primaryTypographyProps={{ 
                                        variant: 'caption',
                                        sx: { 
                                            textDecoration: isCompleted ? 'none' : 'none',
                                            color: isCompleted ? 'success.main' : 'text.secondary'
                                        }
                                    }}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        );
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
            const tasks = await apiGet(API_ENDPOINTS.TASKS);

            // 2. Obtener hábitos completados
            let habitCompletions = [];
            try {
                habitCompletions = await apiGet(`${API_ENDPOINTS.HABITS}/completions`);
            } catch (err) {
                console.warn('No se pudieron cargar los hábitos completados:', err);
                // Continuar solo con tareas si los hábitos fallan
                const taskEvents = transformTasksToEvents(tasks);
                setEvents(taskEvents);
                setLoading(false);
                return;
            }

            // 3. Obtener lista de todos los hábitos activos
            let habits = [];
            try {
                habits = await apiGet(API_ENDPOINTS.HABITS);
                habits = habits.filter(h => h.is_active !== false); // Solo hábitos activos
                setAllHabits(habits);
            } catch (err) {
                console.warn('No se pudieron cargar los hábitos:', err);
            }

            // 4. Calcular estadísticas de hábitos
            const stats = calculateHabitStats(habits, habitCompletions);
            setHabitStats(stats);

            // 5. Transformar a formato FullCalendar
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
                await apiPost(API_ENDPOINTS.TASKS, {
                    title: newTaskTitle,
                    description: '',
                    priority: 'Media',
                    due_date: selectedDate,
                    status: 'Pendiente'
                });
                
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

            await apiPut(`${API_ENDPOINTS.TASKS}/${editingTask.id}`, {
                title: editingTask.title,
                description: editingTask.description,
                priority: editingTask.priority,
                due_date: dueDateString,
                status: editingTask.status
            });
            
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
            await apiDelete(`${API_ENDPOINTS.TASKS}/${editingTask.id}`);
            
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
                Calendario
            </Typography>

                    {/* Leyenda de Colores */}

                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label="Alta Prioridad" size="small" sx={chipStyles(COLORS.task.alta, '#f44336')} />
                    <Chip label="Media Prioridad" size="small" sx={chipStyles(COLORS.task.media, '#ff9800')} />
                    <Chip label="Baja Prioridad" size="small" sx={chipStyles('#2196f3', '#2196f3')} />
                    <Chip label="Completada" size="small" sx={chipStyles('#31dd1eff', '#31dd1eff')} />
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
                            // Personalización de celdas de día
                            dayCellDidMount={(arg) => {
                                const dateStr = arg.date.toISOString().split('T')[0];
                                const stats = habitStats[dateStr];
                                
                                if (stats) {
                                    // Aplicar color de fondo según porcentaje
                                    const bgColor = getHabitDayColor(stats.percentage);
                                    arg.el.style.backgroundColor = bgColor;
                                    
                                    // Agregar borde según porcentaje
                                    if (stats.percentage === 100) {
                                        arg.el.style.border = '2px solid rgba(76, 175, 80, 0.5)';
                                    } else if (stats.percentage >= 50) {
                                        arg.el.style.border = '2px solid rgba(255, 193, 7, 0.5)';
                                    } else if (stats.percentage > 0) {
                                        arg.el.style.border = '2px solid rgba(244, 67, 54, 0.5)';
                                    }
                                }
                            }}
                            dayCellContent={(arg) => {
                                const dateStr = arg.date.toISOString().split('T')[0];
                                const stats = habitStats[dateStr];
                                const streak = stats && stats.percentage === 100 ? calculateStreak(habitStats) : 0;
                                const tooltipContent = getHabitTooltipContent(dateStr);
                                
                                const cellContent = (
                                    <Box sx={{ position: 'relative', width: '100%', height: '100%', p: 0.5 }}>
                                        {/* Número del día */}
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {arg.dayNumberText}
                                        </Typography>
                                        
                                        {/* Badge con estadísticas de hábitos */}
                                        {stats && (
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                top: 2, 
                                                right: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-end',
                                                gap: 0.25
                                            }}>
                                                {/* Badge con número */}
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        bgcolor: stats.percentage === 100 ? 'success.main' : 
                                                                stats.percentage >= 50 ? 'warning.main' : 'error.main',
                                                        color: 'white',
                                                        px: 0.5,
                                                        py: 0.25,
                                                        borderRadius: 0.5,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 'bold',
                                                        lineHeight: 1
                                                    }}
                                                >
                                                    {stats.completed}/{stats.total}
                                                </Typography>
                                                
                                                {/* Racha de fuego */}
                                                {streak > 0 && dateStr === new Date().toISOString().split('T')[0] && (
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold',
                                                            color: 'error.main'
                                                        }}
                                                    >
                                                        🔥{streak}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                );

                                // Si hay estadísticas, envolver en Tooltip
                                if (tooltipContent) {
                                    return (
                                        <Tooltip 
                                            title={tooltipContent}
                                            arrow
                                            placement="top"
                                            enterDelay={300}
                                            leaveDelay={200}
                                        >
                                            {cellContent}
                                        </Tooltip>
                                    );
                                }

                                return cellContent;
                            }}
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
        </PageLayout>
    );
}

export default CalendarPage;
