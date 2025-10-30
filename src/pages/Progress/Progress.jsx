// src/pages/Progress/Progress.jsx

import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Button, Grid, Card, CardContent, CardHeader,
    RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, CircularProgress
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from '../../globalComponents/MainLayout';
import Header from '../../globalComponents/Header';
import AppTheme from '../../shared-theme/AppTheme';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';

// --- NUEVAS IMPORTACIONES ---
import CircularHabitTracker from './CircularHabitTracker';
import './CircularHabitTracker.css'; // Importa los estilos

function Progress(props) {
    // --- ESTADOS PARA LA EXPORTACIÓN (SE MANTIENEN) ---
    const [exportData, setExportData] = useState('ambos');
    const [dateRange, setDateRange] = useState([null, null]);

    // --- NUEVOS ESTADOS PARA EL TRACKER ---
    const [habits, setHabits] = useState([]);
    const [completions, setCompletions] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- NUEVA LÓGICA PARA BUSCAR DATOS ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [habitsRes, completionsRes] = await Promise.all([
                fetch('http://localhost:5000/api/habits', { headers }),
                fetch('http://localhost:5000/api/habits/completions', { headers })
            ]);

            const habitsData = await habitsRes.json();
            const completionsData = await completionsRes.json();

            setHabits(habitsData);
            setCompletions(completionsData);
        } catch (error) {
            console.error("Error al buscar datos de hábitos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    // --- NUEVA FUNCIÓN PARA MANEJAR CLICS ---
    const handleDayClick = async (habitId, dateString, isCompleted) => {
        if (isCompleted) {
            console.log("El hábito ya fue completado este día. Para desmarcar, se necesitaría un nuevo endpoint.");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/habits/${habitId}/checkin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData(); // Recargar datos para reflejar el cambio
            }
        } catch (error) {
            console.error("Error al registrar el check-in:", error);
        }
    };

    // --- FUNCIÓN DE EXPORTACIÓN (SIN CAMBIOS) ---
    const handleExport = async (format) => {
        const dataScope = exportData;
        const [startDate, endDate] = dateRange;
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Debes iniciar sesión para exportar datos.");
            return;
        }
        const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
        const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
        const formatLower = format.toLowerCase();
        const exportURL = `http://localhost:5000/api/export/${dataScope}/${formatLower}?start=${formattedStartDate}&end=${formattedEndDate}`;
        try {
            const response = await fetch(exportURL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }
            const blob = await response.blob();
            let filename = `reporte_${dataScope}.${formatLower === 'excel' ? 'xlsx' : 'pdf'}`;
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/i);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }
            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error de red al intentar exportar:', error);
            alert(`Ocurrió un error de conexión: ${error.message}`);
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                <MainLayout />
                <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'background.default', overflow: 'auto' }}>
                    <Header />
                    <Container maxWidth="lg" sx={{ pt: 2, pb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Estadísticas y Reportes
                        </Typography>

                        <Grid container spacing={3}>
                            {/* SECCIÓN DEL NUEVO HABIT TRACKER */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader title="Tracker Mensual de Hábitos" />
                                    <CardContent>
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <CircularHabitTracker
                                                habits={habits}
                                                completions={completions}
                                                onDayClick={handleDayClick}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* SECCIÓN DE EXPORTACIÓN (INTACTA) */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader title="Función de Exportación de Datos" />
                                    <CardContent>
                                        <Grid container spacing={3} alignItems="center">
                                            <Grid item xs={12} md={4}>
                                                <FormControl>
                                                    <FormLabel>Selector de Datos</FormLabel>
                                                    <RadioGroup row value={exportData} onChange={(e) => setExportData(e.target.value)}>
                                                        <FormControlLabel value="tareas" control={<Radio />} label="Tareas" />
                                                        <FormControlLabel value="habitos" control={<Radio />} label="Hábitos" />
                                                        <FormControlLabel value="ambos" control={<Radio />} label="Ambos" />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={5}>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DateRangePicker
                                                        localeText={{ start: 'Fecha de inicio', end: 'Fecha de fin' }}
                                                        value={dateRange}
                                                        onChange={(newValue) => setDateRange(newValue)}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => handleExport('PDF')}>
                                                        PDF
                                                    </Button>
                                                    <Button variant="outlined" startIcon={<TableViewIcon />} onClick={() => handleExport('Excel')}>
                                                        Excel
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </AppTheme>
    );
}

export default Progress;