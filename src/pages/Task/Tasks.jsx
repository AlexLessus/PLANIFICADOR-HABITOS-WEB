import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Typography, Box, IconButton, Card, CardContent,
    TextField, List, Checkbox, ListItemText, Chip, Modal,
    Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton, Paper, Button,
    FormControlLabel, Switch, Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// --- Iconos ---
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// --- Layout y Componentes ---
import { PageLayout } from '../../components';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';
import API_URL from '../../config/api';

const xThemeComponents = { ...chartsCustomizations, ...dataGridCustomizations, ...datePickersCustomizations, ...treeViewCustomizations };

// --- COLORES PARA LAS TAREAS (Para el borde de la tarjeta) ---
const COLOR_TASK_COMPLETED = '#4CAF50';  // Verde para completadas
const COLOR_TASK_OVERDUE = '#F44336';     // Rojo para vencidas
const COLOR_TASK_PENDING = '#FF9800';     // Naranja para pendientes

// Objeto para mapear prioridades a colores del Chip (MUI Theme)
const priorityColors = {
    alta: 'error',   // Rojo (del tema MUI)
    media: 'warning', // Naranja/Amarillo (del tema MUI)
    baja: 'primary', // Azul (usamos primary si no queremos success para no confundir con "completa"),
};

// Helper para headers con token
const getAuthHeaders = (withJson = false) => {
    const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
};

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

// Constantes para RF-05
const RECURRENCE_FREQUENCIES = [
    'Diaria', 'Semanal', 'Mensual', 
];

function TasksPage(props) {
    const location = useLocation();
    // --- Estados del Componente ---
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [filter, setFilter] = useState('all');
    const [openModal, setOpenModal] = useState(false);

    const [currentTask, setCurrentTask] = useState({
        id: null,
        title: '',
        description: '',
        priority: 'Media',
        due_date: null,
        status: 'Pendiente',
        is_recurring: false,
        frequency: 'Semanal',
        recurrence_end_date: null,
    });

    // --- Detectar si viene de búsqueda y abrir modal ---
    useEffect(() => {
        if (location.state?.openEditModal && location.state?.task) {
            handleOpenModal(location.state.task);
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
                const response = await fetch(`${API_URL}/api/tasks`, {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Error al cargar las tareas');
                }
                const data = await response.json();

                setTasks(data.map(t => ({
                    ...t,
                    is_recurring: !!t.is_recurring,
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
            is_recurring: !!task.is_recurring, 
            frequency: task.frequency || 'Semanal',
            recurrence_end_date: task.recurrence_end_date ? new Date(task.recurrence_end_date) : null,
        } : {
            id: null,
            title: newTaskTitle || '',
            description: '',
            priority: 'Media',
            due_date: null,
            status: 'Pendiente',
            is_recurring: false,
            frequency: 'Semanal',
            recurrence_end_date: null,
        };
        
        setCurrentTask(initialTask);
        setNewTaskTitle('');
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentTask(null);
    };

    const handleModalChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setCurrentTask(prev => ({ ...prev, [name]: checked }));
        } else {
            setCurrentTask(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (newDate) => {
        setCurrentTask(prev => ({ ...prev, due_date: newDate }));
    };

    const handleRecurrenceEndDateChange = (newDate) => {
        setCurrentTask(prev => ({ ...prev, recurrence_end_date: newDate }));
    };

    // --- CRUD: POST y PUT (Guardar) ---
    const handleSaveTask = async () => {
        try {
            const dateToSql = (date) => (
                date instanceof Date && !isNaN(date)
                    ? date.toISOString().split('T')[0]
                    : null
            );
            
            const dueDateString = dateToSql(currentTask.due_date);
            const recurrenceEndDateString = dateToSql(currentTask.recurrence_end_date);
            
            const payload = {
                title: currentTask.title,
                description: currentTask.description,
                priority: currentTask.priority,
                due_date: dueDateString,
                status: currentTask.status, 
                is_recurring: currentTask.is_recurring,
                frequency: currentTask.frequency,
                recurrence_end_date: currentTask.is_recurring ? recurrenceEndDateString : null,
            };

            const url = currentTask.id ? `/api/tasks/${currentTask.id}` : '/api/tasks';
            const method = currentTask.id ? 'PUT' : 'POST';

            const response = await fetch(`${API_URL}${url}`, {
                method: method,
                headers: getAuthHeaders(true),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error al ${currentTask.id ? 'actualizar' : 'crear'} la tarea`);
            }

            const savedTask = await response.json();

            if (currentTask.id) {
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
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
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
            const response = await fetch(`${API_URL}/api/tasks/${task.id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(true),
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el estado');
            }

            const updatedTask = await response.json();
            
            // CORRECCIÓN: Asegurar que mantenemos todos los campos de la tarea
            const fullUpdatedTask = {
                ...task, // Mantener todos los campos originales
                ...updatedTask, // Sobrescribir con los campos actualizados del backend
                is_recurring: !!updatedTask.is_recurring || !!task.is_recurring,
                recurrence_end_date: updatedTask.recurrence_end_date 
                    ? new Date(updatedTask.recurrence_end_date) 
                    : (task.recurrence_end_date ? new Date(task.recurrence_end_date) : null)
            };

            setTasks(tasks.map(t => t.id === fullUpdatedTask.id ? fullUpdatedTask : t));

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // --- FUNCIÓN: Obtener color del borde según estado y fecha ---
    const getTaskBorderColor = (task) => {
        // Si está completada, siempre verde
        if (task.status === 'Completada') {
            return COLOR_TASK_COMPLETED;
        }
        
        // Si está pendiente, verificar si está vencida
        if (task.due_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            
            // Si la fecha de vencimiento ya pasó, rojo
            if (dueDate < today) {
                return COLOR_TASK_OVERDUE;
            }
        }
        
        // Si está pendiente y no ha vencido (o no tiene fecha), naranja
        return COLOR_TASK_PENDING;
    };


    // --- Filtrado Dinámico ---
    const filteredTasks = useMemo(() => {
        let list = tasks;

        if (filter === 'Pendiente') {
            list = list.filter(task => task.status !== 'Completada');
        } else if (filter === 'Completada') {
            list = list.filter(task => task.status === 'Completada');
        }

        list.sort((a, b) => {
            const statusOrder = a.status === 'Completada' ? 1 : -1;
            if (statusOrder !== 0) return statusOrder;

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
                                onKeyPress={(e) => e.key === 'Enter' && handleOpenModal({ title: newTaskTitle, description: '', status: 'Pendiente', priority: 'Media', due_date: null })}
                            />
                            <IconButton
                                color="primary"
                                sx={{ ml: 1 }}
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
                            onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
                        >
                            <ToggleButton value="all">Todas</ToggleButton>
                            <ToggleButton value="Pendiente">Pendientes</ToggleButton>
                            <ToggleButton value="Completada">Completadas</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <List>
                        {filteredTasks.map(task => (
                            <Card 
                                key={task.id} 
                                sx={{ 
                                    mb: 2,
                                    borderLeft: '6px solid',
                                    borderLeftColor: getTaskBorderColor(task), 
                                }}
                            >
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={task.status === 'Completada'}
                                        onChange={() => handleToggleTask(task)}
                                    />

                                    {/* Contenedor del Título y Descripción */}
                                    <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={task.due_date ? `Vence: ${new Date(task.due_date).toLocaleDateString()}` : 'Sin fecha límite'}
                                            sx={{ m: 0 }}
                                            primaryTypographyProps={{
                                                noWrap: true,
                                                variant: 'body1',
                                                fontWeight: 'bold'
                                            }}
                                        />

                                        {task.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5, ml: 0 }}
                                            >
                                                {task.description}
                                            </Typography>
                                        )}

                                        {task.is_recurring && (
                                            <Typography variant="caption" color="primary" sx={{ mt: 0.2 }}>
                                                🔁 Repite {task.frequency} ({task.recurrence_end_date ? `Fin: ${new Date(task.recurrence_end_date).toLocaleDateString()}` : 'Siempre'})
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Prioridad con colores de MUI Theme (AJUSTADO) */}
                                    <Chip
                                        // 1. Mostrar "COMPLETA" si el status es 'Completada', sino mostrar la prioridad
                                        label={task.status === 'Completada' ? 'COMPLETA' : task.priority}
                                        
                                        // 2. Usar 'success' si está completa, sino usar el mapeo de prioridad
                                        color={
                                            task.status === 'Completada' 
                                                ? 'success' 
                                                : priorityColors[task.priority.toLowerCase()] || 'default'
                                        } 
                                        size="small"
                                        sx={{ flexShrink: 0, minWidth: 70 }}
                                    />

                                    {/* Acciones */}
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
                                
                                {/* Controles de Recurrencia */}
                                <Box sx={{ mt: 2, border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={currentTask.is_recurring}
                                                onChange={handleModalChange}
                                                name="is_recurring"
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
        </PageLayout>
    );
}

export default TasksPage;