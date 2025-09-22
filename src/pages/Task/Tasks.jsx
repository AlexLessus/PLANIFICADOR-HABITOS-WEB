import React, { useState, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    IconButton,
    List,
    ListItemIcon,
    Checkbox,
    ListItemText,
    Chip,
    Modal,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    ToggleButton,
    ToggleButtonGroup,
    Paper
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// --- Layout y Tema ---
import MainLayout from '../../globalComponents/MainLayout';
import Header from '../../globalComponents/Header';
import AppTheme from '../../shared-theme/AppTheme';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';

// --- Librerías de Fecha ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// --- Iconos ---
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const xThemeComponents = { ...chartsCustomizations, ...dataGridCustomizations, ...datePickersCustomizations, ...treeViewCustomizations };

// Estilo para el modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

// Objeto para mapear prioridades a colores del Chip
const priorityColors = {
    alta: 'error',
    media: 'warning',
    baja: 'success',
};

function Tasks(props) {
    // --- Estados del Componente ---
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Terminar el reporte de ventas', completed: false, priority: 'alta', dueDate: new Date('2025-09-25') },
        { id: 2, text: 'Agendar reunión con el equipo de diseño', completed: true, priority: 'media', dueDate: new Date('2025-09-22') },
        { id: 3, text: 'Revisar correos pendientes', completed: false, priority: 'baja', dueDate: null },
    ]);
    const [newTaskText, setNewTaskText] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
    const [openModal, setOpenModal] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // --- Lógica para Añadir y Modificar Tareas ---
    const handleAddTask = () => {
        if (newTaskText.trim() === '') return;
        const newTask = {
            id: Date.now(),
            text: newTaskText,
            completed: false,
            priority: 'media',
            dueDate: null
        };
        setTasks([newTask, ...tasks]);
        setNewTaskText('');
    };

    const handleToggleTask = (taskId) => {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const handleUpdateTask = () => {
        setTasks(tasks.map(task => task.id === currentTask.id ? currentTask : task));
        handleCloseModal();
    };

    // --- Lógica del Modal de Edición ---
    const handleOpenModal = (task) => {
        setCurrentTask({ ...task }); // Copiar la tarea para no mutar el estado directamente
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentTask(null);
    };

    const handleModalChange = (e) => {
        setCurrentTask({ ...currentTask, [e.target.name]: e.target.value });
    };

    const handleDateChange = (newDate) => {
        setCurrentTask({ ...currentTask, dueDate: newDate });
    };

    // --- Filtrado de Tareas ---
    const filteredTasks = useMemo(() => {
        switch (filter) {
            case 'completed':
                return tasks.filter(task => task.completed);
            case 'pending':
                return tasks.filter(task => !task.completed);
            default:
                return tasks;
        }
    }, [tasks, filter]);

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
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                            <IconButton color="primary" sx={{ ml: 1 }} onClick={handleAddTask} aria-label="Añadir Tarea">
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
                            <ToggleButton value="pending">Pendientes</ToggleButton>
                            <ToggleButton value="completed">Completadas</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Lista de Tareas */}
                    <List>
                        {filteredTasks.map(task => (
                            <Card key={task.id} sx={{ mb: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(task.id)}
                                    />
                                    <ListItemText
                                        primary={task.text}
                                        secondary={task.dueDate ? `Vence: ${new Date(task.dueDate).toLocaleDateString()}` : 'Sin fecha límite'}
                                        sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                                    />
                                    <Chip
                                        label={task.priority}
                                        color={priorityColors[task.priority] || 'default'}
                                        size="small"
                                    />
                                    <Box>
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
                                <Typography variant="h6" component="h2">Editar Tarea</Typography>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Nombre de la Tarea"
                                    name="text"
                                    value={currentTask.text}
                                    onChange={handleModalChange}
                                />
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Prioridad</InputLabel>
                                    <Select
                                        name="priority"
                                        value={currentTask.priority}
                                        label="Prioridad"
                                        onChange={handleModalChange}
                                    >
                                        <MenuItem value="baja">Baja</MenuItem>
                                        <MenuItem value="media">Media</MenuItem>
                                        <MenuItem value="alta">Alta</MenuItem>
                                    </Select>
                                </FormControl>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Fecha de Vencimiento"
                                        value={currentTask.dueDate ? new Date(currentTask.dueDate) : null}
                                        onChange={handleDateChange}
                                        sx={{ width: '100%', mt: 2 }}
                                    />
                                </LocalizationProvider>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button onClick={handleCloseModal}>Cancelar</Button>
                                    <Button variant="contained" onClick={handleUpdateTask}>Guardar Cambios</Button>
                                </Box>
                            </Box>
                        </Modal>
                    )}
                </Container>
            </Box>
        </AppTheme>
    );
}

export default Tasks;