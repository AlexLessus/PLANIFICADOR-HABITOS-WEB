import React, { useState } from 'react';
import {
    Container,
    Typography,
    Fab,
    List,
    Card,
    CardContent,
    ListItemIcon,
    Checkbox,
    ListItemText,
    IconButton,
    Modal,
    Box,
    TextField,
    Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CssBaseline from '@mui/material/CssBaseline'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../../globalComponents/MainLayout'; // Layout principal con navbar y side menu
import AppTheme from '../../shared-theme/AppTheme'; // Tema personalizado
import { //estilos personalizados para componentes MUI
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../DashboardPage/theme/customizations';

const xThemeComponents = { // combinando todas las personalizaciones
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

// Estilo para el modal (la ventana emergente)
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

function Habits(props) {
    // Estado para almacenar la lista de hábitos (con datos de ejemplo)
    const [habits, setHabits] = useState([
        { id: 1, name: 'Leer 30 minutos', streak: 5, lastCompleted: new Date('2025-09-19') },
        { id: 2, name: 'Hacer ejercicio', streak: 15, lastCompleted: new Date('2025-09-20') },
        { id: 3, name: 'Meditar 10 minutos', streak: 0, lastCompleted: null },
    ]);

    // Estados para manejar el modal y el formulario
    const [openModal, setOpenModal] = useState(false);
    const [currentHabit, setCurrentHabit] = useState(null); // Para saber si estamos editando
    const [habitName, setHabitName] = useState('');

    // --- Funciones para manejar el Modal ---
    const handleOpenModal = (habit = null) => {
        setCurrentHabit(habit);
        setHabitName(habit ? habit.name : '');
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentHabit(null);
        setHabitName('');
    };

    // --- Funciones para manejar los Hábitos ---
    const handleSaveHabit = () => {
        if (currentHabit) {
            // Lógica para editar un hábito existente
            setHabits(habits.map(h => h.id === currentHabit.id ? { ...h, name: habitName } : h));
        } else {
            // Lógica para añadir un nuevo hábito
            const newHabit = {
                id: Date.now(), // ID único simple
                name: habitName,
                streak: 0,
                lastCompleted: null,
            };
            setHabits([...habits, newHabit]);
        }
        handleCloseModal();
    };

    const handleDeleteHabit = (habitId) => {
        setHabits(habits.filter(h => h.id !== habitId));
    };

    const handleCheckIn = (habitId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizar a la medianoche

        setHabits(habits.map(habit => {
            if (habit.id === habitId) {
                const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
                if (lastCompleted) {
                    lastCompleted.setHours(0, 0, 0, 0);
                }

                // Si ya se completó hoy, no hacer nada
                if (lastCompleted && lastCompleted.getTime() === today.getTime()) {
                    return habit;
                }

                // Calcular la nueva racha
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                const newStreak = (lastCompleted && lastCompleted.getTime() === yesterday.getTime())
                    ? habit.streak + 1
                    : 1;

                return { ...habit, streak: newStreak, lastCompleted: new Date() };
            }
            return habit;
        }));
    };

    // Función auxiliar para verificar si el hábito se completó hoy
    const isCompletedToday = (lastCompletedDate) => {
        if (!lastCompletedDate) return false;
        const today = new Date();
        const lastDate = new Date(lastCompletedDate);
        return today.toDateString() === lastDate.toDateString();
    };


    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme /> {/* Restablece los estilos base */}
            <Box sx={{ display: 'flex' }}>{/* Contenedor del contenido principal del layout */}
                <MainLayout />{/* Layout con Navbar y SideMenu */}
                <Container maxWidth="md" sx={{ marginTop: 4 }}>
                    {/* Título de la Página */}
                    <Typography variant="h4" component="h1" gutterBottom>
                        Mis Hábitos
                    </Typography>

                    {/* Lista de Hábitos Activos */}
                    <List>
                        {habits.map((habit) => (
                            <Card key={habit.id} sx={{ marginBottom: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                    {/* Mecanismo de "Check-in" Diario */}
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={isCompletedToday(habit.lastCompleted)}
                                            onChange={() => handleCheckIn(habit.id)}
                                        />
                                    </ListItemIcon>

                                    {/* Nombre del Hábito y Contador de Racha */}
                                    <ListItemText
                                        primary={habit.name}
                                        secondary={`Racha actual: ${habit.streak} días`}
                                    />

                                    {/* Opciones de Gestión */}
                                    <IconButton onClick={() => handleOpenModal(habit)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteHabit(habit.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        ))}
                    </List>

                    {/* Botón para "Añadir un Nuevo Hábito" */}
                    <Fab
                        color="primary"
                        aria-label="add"
                        sx={{ position: 'fixed', bottom: 32, right: 32 }}
                        onClick={() => handleOpenModal()}
                    >
                        <AddIcon />
                    </Fab>

                    {/* Formulario o Modal para Crear/Editar un Hábito */}
                    <Modal open={openModal} onClose={handleCloseModal}>
                        <Box sx={modalStyle}>
                            <Typography variant="h6" component="h2">
                                {currentHabit ? 'Editar Hábito' : 'Añadir Nuevo Hábito'}
                            </Typography>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Nombre del Hábito"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={habitName}
                                onChange={(e) => setHabitName(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Cancelar</Button>
                                <Button variant="contained" onClick={handleSaveHabit}>Guardar</Button>
                            </Box>
                        </Box>
                    </Modal>
                </Container>
            </Box>
        </AppTheme>
    );
}

export default Habits;