import React, { useState } from 'react';
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
    Paper
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// --- Layout y Tema ---
import MainLayout from '../../globalComponents/MainLayout';
import AppTheme from '../../shared-theme/AppTheme';
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from '../DashboardPage/theme/customizations';

// --- Componentes de FullCalendar ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // para clics

const xThemeComponents = { ...chartsCustomizations, ...dataGridCustomizations, ...datePickersCustomizations, ...treeViewCustomizations };

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

// --- Datos de ejemplo combinados (Tareas y Hábitos completados) ---
const initialEvents = [
    // Tareas
    { id: 'task-1', title: 'Terminar el reporte de ventas', date: '2025-09-25', color: '#f44336', extendedProps: { type: 'task' } },
    { id: 'task-2', title: 'Revisar correos pendientes', date: '2025-09-28', color: '#ff9800', extendedProps: { type: 'task' } },
    // Hábitos Completados
    { id: 'habit-1-20', title: 'Hábito: Hacer ejercicio', date: '2025-09-20', display: 'background', color: '#4caf50' },
    { id: 'habit-2-20', title: 'Hábito: Leer 30 minutos', date: '2025-09-20', display: 'background', color: '#4caf50' },
    { id: 'habit-1-21', title: 'Hábito: Hacer ejercicio', date: '2025-09-21', display: 'background', color: '#4caf50' },
];


function CalendarPage(props) {
    const [events, setEvents] = useState(initialEvents);
    const [openModal, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // --- Manejadores de Eventos del Calendario ---
    const handleDateClick = (arg) => {
        setSelectedDate(arg.dateStr);
        setOpenModal(true);
    };

    const handleEventClick = (clickInfo) => {
        // En una app real, podrías abrir un modal con detalles del evento
        alert(`Evento seleccionado: '${clickInfo.event.title}'\nFecha: ${clickInfo.event.start.toLocaleDateString()}`);
    };

    // --- Lógica del Modal para Añadir Tarea ---
    const handleCloseModal = () => {
        setOpenModal(false);
        setNewTaskTitle('');
        setSelectedDate(null);
    };

    const handleAddTask = () => {
        if (newTaskTitle.trim() && selectedDate) {
            const newEvent = {
                id: `task-${Date.now()}`,
                title: newTaskTitle,
                date: selectedDate,
                color: '#2196f3', // Color azul para nuevas tareas
                extendedProps: { type: 'task' }
            };
            setEvents([...events, newEvent]);
            handleCloseModal();
        }
    };

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Container maxWidth="xl" sx={{ marginTop: 4, flexGrow: 1, padding: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Calendario
                    </Typography>

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
                            events={events}
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

                    {/* El modal se mantiene exactamente igual */}
                    <Dialog open={openModal} onClose={handleCloseModal}>
                        {/* ...contenido del modal... */}
                    </Dialog>
                </Container>
            </Box>
        </AppTheme>
    );
}

export default CalendarPage;
