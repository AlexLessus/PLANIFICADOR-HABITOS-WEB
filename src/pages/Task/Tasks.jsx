import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container, Typography, Box, IconButton, Card, CardContent,
    TextField, List, Checkbox, ListItemText, Chip, Modal,
    Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton, Paper, Button,
    // Componentes nuevos para Recurrencia
    FormControlLabel, Switch
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// --- Iconos ---
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// --- Layout y Tema ---
import MainLayout from '../../globalComponents/MainLayout';
import Header from '../../globalComponents/Header';
import AppTheme from '../../shared-theme/AppTheme';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';

const xThemeComponents = { ...chartsCustomizations, ...dataGridCustomizations, ...datePickersCustomizations, ...treeViewCustomizations };

// Helper para headers con token (Copiado de HabitsPage)
const getAuthHeaders = (withJson = false) => {
    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
};

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 450, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4,
};

// Objeto para mapear prioridades a colores del Chip
const priorityColors = {
    alta: 'error',
    media: 'warning',
    baja: 'success',
};

// **Nuevas constantes para RF-05**
const RECURRENCE_FREQUENCIES = [
    'Diaria', 'Semanal', 'Mensual', 
];

function TasksPage(props) {
    const location = useLocation();
    // --- Estados del Componente ---
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState(''); // Cambiado de newTaskText a newTaskTitle
    const [filter, setFilter] = useState('all'); // 'all', 'Pendiente', 'Completada'
    const [openModal, setOpenModal] = useState(false);

    // Estado inicial de la tarea, basado en los campos de la BD
    const [currentTask, setCurrentTask] = useState({
        id: null,
        title: '',
        description: '',
        priority: 'Media',
        due_date: null, // null para la fecha
        status: 'Pendiente',
        // --- Campos de Recurrencia (RF-05) ---
        is_recurring: false,
        frequency: 'Semanal', // Valor por defecto
        recurrence_end_date: null, // null para fecha de fin opcional
    });

    // --- Detectar si viene de búsqueda y abrir modal ---
    useEffect(() => {
        if (location.state?.openEditModal && location.state?.task) {
            handleOpenModal(location.state.task);
            // Limpiar el state para que no se abra de nuevo al recargar
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // --- Carga de Datos Inicial (GET) ---
    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Error: Debes iniciar sesión para ver tus tareas.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/tasks', {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Error al cargar las tareas');
                }
                const data = await response.json();

                // Mapear datos, asegurando que los nuevos campos estén presentes para evitar errores
                setTasks(data.map(t => ({
                    ...t,
                    is_recurring: !!t.is_recurring, // Asegurar boolean
                    frequency: t.frequency || 'Semanal',
                    recurrence_end_date: t.recurrence_end_date ? new Date(t.recurrence_end_date) : null
                }))); 

                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // --- Lógica de Modales ---
    const handleOpenModal = (task = null) => {
        const initialTask = task ? {
            ...task,
            description: task.description || '',
            due_date: task.due_date ? new Date(task.due_date) : null,
            // Mapeo de campos de recurrencia
            is_recurring: !!task.is_recurring, 
            frequency: task.frequency || 'Semanal',
            recurrence_end_date: task.recurrence_end_date ? new Date(task.recurrence_end_date) : null,
        } : {
            id: null,
            title: newTaskTitle || '', // Usa el título del TextField si existe
            description: '',
            priority: 'Media',
            due_date: null,
            status: 'Pendiente',
            // Valores por defecto de recurrencia
            is_recurring: false,
            frequency: 'Semanal',
            recurrence_end_date: null,
        };
        
        setCurrentTask(initialTask);
        setNewTaskTitle(''); // Limpiar el campo de entrada rápida
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentTask(null);
    };

    const handleModalChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Manejar Switch/Checkbox
        if (type === 'checkbox') {
            setCurrentTask(prev => ({ ...prev, [name]: checked }));
        } else {
            setCurrentTask(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (newDate) => {
        setCurrentTask(prev => ({ ...prev, due_date: newDate }));
    };

    // **Nuevo handler para la fecha de fin de recurrencia**
    const handleRecurrenceEndDateChange = (newDate) => {
        setCurrentTask(prev => ({ ...prev, recurrence_end_date: newDate }));
    };

    // --- CRUD: POST y PUT (Guardar) ---
    const handleSaveTask = async () => {
        try {
            // Helper para convertir Date a formato SQL AAAA-MM-DD
            const dateToSql = (date) => (
                date instanceof Date && !isNaN(date)
                    ? date.toISOString().split('T')[0]
                    : null
            );
            
            // 1. Convertir fechas
            const dueDateString = dateToSql(currentTask.due_date);
            const recurrenceEndDateString = dateToSql(currentTask.recurrence_end_date);
            
            // 2. Crear Payload, incluyendo los campos de recurrencia
            const payload = {
                title: currentTask.title,
                description: currentTask.description,
                priority: currentTask.priority,
                due_date: dueDateString,
                status: currentTask.status, 
                // --- Campos de Recurrencia ---
                is_recurring: currentTask.is_recurring,
                frequency: currentTask.frequency,
                recurrence_end_date: currentTask.is_recurring ? recurrenceEndDateString : null,
            };

            const url = currentTask.id ? `/api/tasks/${currentTask.id}` : '/api/tasks';
            const method = currentTask.id ? 'PUT' : 'POST';

            const response = await fetch(`http://localhost:5000${url}`, {
                method: method,
                headers: getAuthHeaders(true),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error al ${currentTask.id ? 'actualizar' : 'crear'} la tarea`);
            }

            const savedTask = await response.json();

            // Actualiza el estado de las tareas
            if (currentTask.id) {
                // Asegurar que los datos de recurrencia se mantengan como booleans/Dates
                const updatedTaskData = {
                    ...savedTask,
                    is_recurring: !!savedTask.is_recurring,
                    recurrence_end_date: savedTask.recurrence_end_date ? new Date(savedTask.recurrence_end_date) : null
                };
                setTasks(tasks.map(t => t.id === updatedTaskData.id ? updatedTaskData : t));
            } else {
                const newTaskData = {
                    ...savedTask,
                    is_recurring: !!savedTask.is_recurring,
                    recurrence_end_date: savedTask.recurrence_end_date ? new Date(savedTask.recurrence_end_date) : null
                };
                setTasks([...tasks, newTaskData]);
            }

            handleCloseModal();
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // --- CRUD: DELETE (Eliminar) ---
    const handleDeleteTask = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la tarea');
            }

            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // --- CRUD: PUT (Cambiar Estado/Completar) ---
    const handleToggleTask = async (task) => {
        const newStatus = task.status === 'Completada' ? 'Pendiente' : 'Completada';

        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${task.id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el estado');
            }

            const updatedTask = await response.json();

            // Reemplaza la tarea antigua con la actualizada
            setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // --- Filtrado Dinámico ---
    const filteredTasks = useMemo(() => {
        let list = tasks;

        // 1. Filtrar por estado
        if (filter === 'Pendiente') {
            list = list.filter(task => task.status !== 'Completada');
        } else if (filter === 'Completada') {
            list = list.filter(task => task.status === 'Completada');
        }

        // 2. Opcional: Ordenar por prioridad/fecha (para mejor UX)
        list.sort((a, b) => {
            // Ordenar pendientes primero, luego por prioridad
            const statusOrder = a.status === 'Completada' ? 1 : -1;
            if (statusOrder !== 0) return statusOrder;

            // Ordenar por prioridad (alta: 1, media: 2, baja: 3)
            const priorityMap = { 'alta': 1, 'media': 2, 'baja': 3 };
            return priorityMap[a.priority.toLowerCase()] - priorityMap[b.priority.toLowerCase()];
        });

        return list;
    }, [tasks, filter]);
    
    if (loading) {}

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Header />
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Container maxWidth="lg" sx={{ marginTop: 0, flexGrow: 1, padding: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Gestor de Tareas
                    </Typography>

                    {/* Formulario para añadir nuevas tareas */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Añadir una nueva tarea..."
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                // Usar el handler del modal con los valores iniciales
                                onKeyPress={(e) => e.key === 'Enter' && handleOpenModal({ title: newTaskTitle, description: '', status: 'Pendiente', priority: 'Media', due_date: null })}
                            />
                            <IconButton
                                color="primary"
                                sx={{ ml: 1 }}
                                // Usar el handler del modal con los valores iniciales
                                onClick={() => handleOpenModal({ title: newTaskTitle, description: '', status: 'Pendiente', priority: 'Media', due_date: null })}
                                aria-label="Añadir Tarea"
                            >
                                <AddCircleIcon sx={{ fontSize: '2rem' }} />
                            </IconButton>
                        </Box>
                    </Paper>

                    {/* Filtros de Tareas */}
                    <Box sx={{ mb: 3 }}>
                        <ToggleButtonGroup
                            color="primary"
                            value={filter}
                            exclusive
                            // El filtro ahora usa los valores de STATUS de la BD
                            onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
                        >
                            <ToggleButton value="all">Todas</ToggleButton>
                            <ToggleButton value="Pendiente">Pendientes</ToggleButton>
                            <ToggleButton value="Completada">Completadas</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <List>
                        {filteredTasks.map(task => (
                            <Card key={task.id} sx={{ mb: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={task.status === 'Completada'}
                                        onChange={() => handleToggleTask(task)}
                                    />

                                    {/* 1. Contenedor del Título y Descripción (Flex-Grow) */}
                                    <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

                                        {/* A. Título y Subtítulo (Fecha) */}
                                        <ListItemText
                                            primary={task.title}
                                            secondary={task.due_date ? `Vence: ${new Date(task.due_date).toLocaleDateString()}` : 'Sin fecha límite'}
                                            sx={{ textDecoration: task.status === 'Completada' ? 'line-through' : 'none', m: 0 }}
                                            primaryTypographyProps={{
                                                noWrap: true, // Para prevenir que el título también choque
                                                variant: 'body1',
                                                fontWeight: 'bold'
                                            }}
                                        />

                                        {/* B. Descripción (Solo si existe) */}
                                        {task.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.5,
                                                    ml: 0,
                               
                                                }}
                                            >
                                                {task.description}
                                            </Typography>
                                        )}

                                        {/* C. Indicador de Recurrencia (NUEVO) */}
                                        {task.is_recurring && (
                                            <Typography variant="caption" color="primary" sx={{ mt: 0.2 }}>
                                                🔁 Repite {task.frequency} ({task.recurrence_end_date ? `Fin: ${new Date(task.recurrence_end_date).toLocaleDateString()}` : 'Siempre'})
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* 2. Prioridad */}
                                    <Chip
                                        label={task.priority}
                                        color={priorityColors[task.priority.toLowerCase()] || 'default'}
                                        size="small"
                                        sx={{ flexShrink: 0 }} // Para evitar que se comprima
                                    />

                                    {/* 3. Acciones */}
                                    <Box sx={{ flexShrink: 0 }}>
                                        <IconButton size="small" onClick={() => handleOpenModal(task)}><EditIcon /></IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteTask(task.id)}><DeleteIcon /></IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </List>

                    {/* Modal para Editar Tarea */}
                    {currentTask && (
                        <Modal open={openModal} onClose={handleCloseModal}>
                            <Box sx={modalStyle}>
                                <Typography variant="h6" component="h2" gutterBottom>{currentTask.id ? 'Editar Tarea' : 'Añadir Nueva Tarea'}</Typography>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre de la Tarea"
                                    name="title"
                                    value={currentTask.title}
                                    onChange={handleModalChange}
                                />

                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Descripción (Opcional)"
                                    name="description"
                                    value={currentTask.description || ''}
                                    onChange={handleModalChange}
                                    rows={3}
                                />

                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Prioridad</InputLabel>
                                    <Select
                                        name="priority"
                                        value={currentTask.priority}
                                        label="Prioridad"
                                        onChange={handleModalChange}
                                    >
                                        <MenuItem value="Baja">Baja</MenuItem>
                                        <MenuItem value="Media">Media</MenuItem>
                                        <MenuItem value="Alta">Alta</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                {/* Selector de Estado (Solo si editas) */}
                                {currentTask.id && ( 
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            name="status"
                                            value={currentTask.status}
                                            label="Estado"
                                            onChange={handleModalChange}
                                        >
                                            <MenuItem value="Pendiente">Pendiente</MenuItem>
                                            <MenuItem value="Completada">Completada</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                                
                                {/* --- CONTROLES DE RECURRENCIA (RF-05) --- */}
                                <Box sx={{ mt: 2, border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={currentTask.is_recurring}
                                                onChange={handleModalChange}
                                                name="is_recurring" // Usar name en el Switch para handleModalChange
                                            />
                                        }
                                        label="Tarea Recurrente"
                                        sx={{ mb: 1 }}
                                    />

                                    {currentTask.is_recurring && (
                                        <>
                                            <FormControl fullWidth margin="normal" size="small">
                                                <InputLabel>Frecuencia de Repetición</InputLabel>
                                                <Select
                                                    name="frequency"
                                                    value={currentTask.frequency}
                                                    label="Frecuencia de Repetición"
                                                    onChange={handleModalChange}
                                                >
                                                    {RECURRENCE_FREQUENCIES.map(freq => (
                                                        <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    label="Fecha de Finalización (Opcional)"
                                                    value={currentTask.recurrence_end_date}
                                                    onChange={handleRecurrenceEndDateChange}
                                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mt: 1 } } }}
                                                />
                                            </LocalizationProvider>
                                        </>
                                    )}
                                </Box>
                                {/* --- FIN CONTROLES DE RECURRENCIA --- */}

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Fecha de Vencimiento (Instancia Actual)"
                                        value={currentTask.due_date}
                                        onChange={handleDateChange}
                                        sx={{ width: '100%', mt: 2 }}
                                    />
                                </LocalizationProvider>

                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button onClick={handleCloseModal}>Cancelar</Button>
                                    <Button variant="contained" onClick={handleSaveTask}>Guardar Cambios</Button>
                                </Box>
                            </Box>
                        </Modal>
                    )}
                </Container>
            </Box>
        </AppTheme>
    );
}

export default TasksPage;