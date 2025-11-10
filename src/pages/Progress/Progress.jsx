// src/pages/Progress/Progress.jsx

import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Grid, Card, CardContent, CardHeader,
    RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, CircularProgress
} from '@mui/material';
import { PageLayout } from '../../components';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';

// --- NUEVAS IMPORTACIONES ---
import CircularHabitTracker from './CircularHabitTracker';
import './CircularHabitTracker.css'; // Importa los estilos
import AnnualHabitHeatmap from './AnnualHabitHeatmap';
import './AnnualHabitHeatmap.css';
import HabitPet from './HabitPet'; 

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
        <PageLayout {...props}>
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
                Estadísticas y Reportes
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {/* SECCIÓN DEL NUEVO HABIT TRACKER */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: { xs: 2, md: 3 },
                            boxShadow: { xs: 1, sm: 2 },
                        }}
                    >
                        <CardHeader
                            title="Tracker Mensual de Hábitos"
                            sx={{
                                '& .MuiCardHeader-title': {
                                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                                },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1.5, sm: 2 },
                            }}
                        />
                        <CardContent
                            sx={{
                                px: { xs: 2, sm: 3 },
                                py: { xs: 2, sm: 2.5 },
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <HabitPet habits={habits} />
                                    <CircularHabitTracker
                                        habits={habits}
                                        completions={completions}
                                        onDayClick={handleDayClick}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* SECCIÓN DEL NUEVO HEATMAP ANUAL */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: { xs: 2, md: 3 },
                            boxShadow: { xs: 1, sm: 2 },
                        }}
                    >
                        <CardHeader
                            title="Visualización Anual de Hábitos"
                            sx={{
                                '& .MuiCardHeader-title': {
                                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                                },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1.5, sm: 2 },
                            }}
                        />
                        <CardContent
                            sx={{
                                px: { xs: 1, sm: 3 },
                                py: { xs: 2, sm: 2.5 },
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: { xs: 3, md: 4 },
                                        overflowX: 'auto',
                                        overflowY: 'visible',
                                        // Scroll horizontal en móvil
                                        '&::-webkit-scrollbar': {
                                            height: 8,
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            borderRadius: 4,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(0,0,0,0.3)',
                                            borderRadius: 4,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                            },
                                        },
                                    }}
                                >
                                    <Box sx={{ minWidth: { xs: '700px', md: 'auto' } }}>
                                        <AnnualHabitHeatmap completions={completions} year={2025} />
                                    </Box>
                                    <Box sx={{ minWidth: { xs: '700px', md: 'auto' } }}>
                                        <AnnualHabitHeatmap completions={completions} year={2026} />
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* SECCIÓN DE EXPORTACIÓN */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: { xs: 2, md: 3 },
                            boxShadow: { xs: 1, sm: 2 },
                        }}
                    >
                        <CardHeader
                            title="Función de Exportación de Datos"
                            sx={{
                                '& .MuiCardHeader-title': {
                                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                                },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1.5, sm: 2 },
                            }}
                        />
                        <CardContent
                            sx={{
                                px: { xs: 2, sm: 3 },
                                py: { xs: 2, sm: 2.5 },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    gap: { xs: 3, md: 4 },
                                    alignItems: { xs: 'stretch', md: 'center' },
                                }}
                            >
                                {/* Selector de Datos */}
                                <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
                                    <FormLabel
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            mb: 1,
                                        }}
                                    >
                                        Selector de Datos
                                    </FormLabel>
                                    <RadioGroup
                                        row={false}
                                        value={exportData}
                                        onChange={(e) => setExportData(e.target.value)}
                                    >
                                        <FormControlLabel value="tareas" control={<Radio />} label="Tareas" />
                                        <FormControlLabel value="habitos" control={<Radio />} label="Hábitos" />
                                        <FormControlLabel value="ambos" control={<Radio />} label="Ambos" />
                                    </RadioGroup>
                                </FormControl>

                                {/* Botones de Exportación */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: { xs: 1.5, sm: 2 },
                                        flexGrow: 1,
                                        justifyContent: { xs: 'stretch', md: 'flex-end' },
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<PictureAsPdfIcon />}
                                        onClick={() => handleExport('PDF')}
                                        fullWidth={{ xs: true, sm: false }}
                                        sx={{
                                            minHeight: 44,
                                            px: { xs: 2, md: 3 },
                                        }}
                                    >
                                        Exportar PDF
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<TableViewIcon />}
                                        onClick={() => handleExport('Excel')}
                                        fullWidth={{ xs: true, sm: false }}
                                        sx={{
                                            minHeight: 44,
                                            px: { xs: 2, md: 3 },
                                        }}
                                    >
                                        Exportar Excel
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </PageLayout>
    );
}

export default Progress;