import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Typography, Box, IconButton, Card, CardContent,
    TextField, List, Checkbox, ListItemText, Chip, Modal,
    Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton, Paper, Button
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

function TasksPage(props) {
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
    });

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

                // Nota: Convertir 'title' a 'text' para compatibilidad con el código estático anterior (ahora lo cambiaremos)
                setTasks(data); // Se espera que la BD devuelva los campos correctos (title, priority, etc.)
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
        // Mapea los valores de la tarea existente o inicializa una nueva
        setCurrentTask(task ? { ...task, description: task.description || '', due_date: task.due_date ? new Date(task.due_date) : null } : {
            id: null,
            title: '',
            description: '',
            priority: 'Media',
            due_date: null,
            status: 'Pendiente',
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentTask(null);
    };

    const handleModalChange = (e) => {
        setCurrentTask(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (newDate) => {
        setCurrentTask(prev => ({ ...prev, due_date: newDate }));
    };


    // --- CRUD: POST y PUT (Guardar) ---
    const handleSaveTask = async () => {
        try {
            // Prepara los datos (convertir la fecha a formato SQL AAAA-MM-DD)
            const dueDateString = currentTask.due_date instanceof Date && !isNaN(currentTask.due_date)
                ? currentTask.due_date.toISOString().split('T')[0]
                : null;

            const payload = {
                title: currentTask.title,
                description: currentTask.description,
                priority: currentTask.priority,
                due_date: dueDateString,
                status: currentTask.status, // Necesario para la actualización (PUT)
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
                setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
            } else {
                setTasks([...tasks, savedTask]);
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

    if (loading) {
        return <p>Cargando tareas...</p>;
    }

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
                            // El filtro ahora usa los valores de STATUS de la BD
                            onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
                        >
                            <ToggleButton value="all">Todas</ToggleButton>
                            <ToggleButton value="Pendiente">Pendientes</ToggleButton>
                            <ToggleButton value="Completada">Completadas</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Lista de Tareas */}

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
                                                // Quitamos todos los estilos de 'whiteSpace: nowrap' y 'textOverflow: ellipsis'
                                                // para permitir que la descripción salte de línea.
                                                sx={{
                                                    mt: 0.5,
                                                    ml: 0, // Ajuste para alineación con el título
                                                    fontStyle: 'italic',
                                                    // OPCIONAL: Puedes limitar las líneas a 2 o 3 si lo deseas:
                                                    // display: '-webkit-box',
                                                    // overflow: 'hidden',
                                                    // WebkitBoxOrient: 'vertical',
                                                    // WebkitLineClamp: 2, 
                                                }}
                                            >
                                                {task.description}
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
                                <Typography variant="h6" component="h2">{currentTask.id ? 'Editar Tarea' : 'Añadir Nueva Tarea'}</Typography>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre de la Tarea"
                                    name="title" // Cambiado de "text" a "title"
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
                                    multiline
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
                                {currentTask.id && ( // Solo mostrar el selector de estado si estás editando
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
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Fecha de Vencimiento"
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