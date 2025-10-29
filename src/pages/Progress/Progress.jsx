import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    CardHeader,
    ToggleButtonGroup,
    ToggleButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import MainLayout from '../../globalComponents/MainLayout'; // Layout principal
import Header from '../../globalComponents/Header'; // Header
import AppTheme from '../../shared-theme/AppTheme'; // Tema personalizado

// --- Librerías para Gráficos y Selectores de Fecha ---
import { BarChart } from '@mui/x-charts/BarChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // O AdapterDayjs
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

// --- Iconos ---
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView'; // Para representar Excel/CSV

import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../DashboardPage/theme/customizations';

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

// --- Datos de ejemplo ---
const weeklyTaskData = [
    { day: 'Lun', completed: 80 }, { day: 'Mar', completed: 60 },
    { day: 'Mié', completed: 75 }, { day: 'Jue', completed: 90 },
    { day: 'Vie', completed: 85 }, { day: 'Sáb', completed: 40 },
    { day: 'Dom', completed: 50 },
];

const monthlyTaskData = [
    { week: 'Sem 1', completed: 70 }, { week: 'Sem 2', completed: 85 },
    { week: 'Sem 3', completed: 75 }, { week: 'Sem 4', completed: 90 },
];

const habitsStreakData = [
    { id: 1, name: 'Leer 30 minutos', currentStreak: 5, longestStreak: 25 },
    { id: 2, name: 'Hacer ejercicio', currentStreak: 15, longestStreak: 15 },
    { id: 3, name: 'Meditar 10 minutos', currentStreak: 0, longestStreak: 8 },
];

function Progress(props) {
    const [timeRange, setTimeRange] = useState('semanal');
    const [exportData, setExportData] = useState('ambos');
    // dateRange[0] = fecha de inicio, dateRange[1] = fecha de fin
    const [dateRange, setDateRange] = useState([null, null]); 

    const handleTimeRangeChange = (event, newRange) => {
        if (newRange !== null) {
            setTimeRange(newRange);
        }
    };

const handleExport = async (format) => {
    const dataScope = exportData; 
    const [startDate, endDate] = dateRange;

    // 1. OBTENER EL TOKEN JWT DEL ALMACENAMIENTO
    const token = localStorage.getItem('token'); 

    if (!token) {
        alert("Debes iniciar sesión para exportar datos. No se encontró el token de autenticación.");
        return; 
    }

    // 2. Formatear las fechas a YYYY-MM-DD para la API
    const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : '';
    const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : '';
    
    const formatLower = format.toLowerCase(); 

    // Importante: Verifica que esta estructura de URL coincida con tu exportRoutes.js
    // Estructura actual: /api/export/:dataType/:format (ej. /ambos/excel)
    const exportURL = 
        `http://localhost:5000/api/export/${dataScope}/${formatLower}?start=${formattedStartDate}&end=${formattedEndDate}`;

    try {
        // 3. USAR FETCH para enviar el token
        const response = await fetch(exportURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
            },
        });

        if (response.status === 401 || response.status === 403) {
            const errorText = await response.json().catch(() => ({error: 'Token Inválido o Expirado.'}));
            alert(`Error de Autenticación: ${errorText.error || response.statusText}`);
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error del Servidor: ${errorText}`);
            return;
        }

        // --- INICIO DE LA CORRECCIÓN DE LA DESCARGA ---
        const blob = await response.blob();
        
        // Definir la extensión correcta para el *fallback*
        const extension = formatLower === 'excel' ? 'xlsx' : 'pdf';
        
        // 1. Definir un nombre de archivo *fallback* (Ej: reporte_tareas.xlsx)
        let filename = `reporte_${dataScope}.${extension}`;
        
        // 2. Intentar obtener el nombre del archivo del header 'Content-Disposition' del backend
        const contentDisposition = response.headers.get('Content-Disposition');
        
        if (contentDisposition) {
            // Busca la parte 'filename="[...]"' y usa ese valor
            const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/i);
            if (filenameMatch && filenameMatch.length > 1) {
                //USAR EL NOMBRE Y EXTENSIÓN QUE ENVÍA EL BACKEND (termina en .xlsx)
                filename = filenameMatch[1]; 
            }
        }
        
        // 3. Forzar la descarga con el nombre que incluye la extensión correcta
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = filename; 
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(urlBlob);
        // --- FIN DE LA CORRECCIÓN DE LA DESCARGA ---
        
    } catch (error) {
        console.error('Error de red al intentar exportar:', error);
        alert('Ocurrió un error de conexión al intentar exportar.');
    }
};


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
                    <Container maxWidth="lg" sx={{ pt: 2, pb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Estadísticas y Reportes
                        </Typography>

                    {/* Filtros de Rango de Tiempo */}
                    <Box sx={{ marginBottom: 3 }}>
                        <ToggleButtonGroup
                            color="primary"
                            value={timeRange}
                            exclusive
                            onChange={handleTimeRangeChange}
                            aria-label="Rango de tiempo"
                        >
                            <ToggleButton value="semanal">Semanal</ToggleButton>
                            <ToggleButton value="mensual">Mensual</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Sección de Estadísticas de Tareas */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardHeader title="Estadísticas de Tareas" subheader={timeRange === 'semanal' ? 'Últimos 7 días' : 'Últimas 4 semanas'} />
                                <CardContent>
                                    <Typography variant="h6">Tasa de Completado</Typography>
                                    <Box sx={{ height: 300 }}>
                                        <BarChart
                                            dataset={timeRange === 'semanal' ? weeklyTaskData : monthlyTaskData}
                                            xAxis={[{ scaleType: 'band', dataKey: timeRange === 'semanal' ? 'day' : 'week' }]}
                                            series={[{ dataKey: 'completed', label: '% Completado', valueFormatter: (value) => `${value}%` }]}
                                            layout="vertical"
                                        />
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>Contadores Totales</Typography>
                                    <Typography variant="body1">Tareas Completadas: <strong>45</strong></Typography>
                                    <Typography variant="body1">Tareas Pendientes: <strong>12</strong></Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Sección de Estadísticas de Hábitos */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardHeader title="Estadísticas de Hábitos" />
                                <CardContent>
                                    <Typography variant="h6">Historial de Rachas</Typography>
                                    <List dense>
                                        {habitsStreakData.map(habit => (
                                            <ListItem key={habit.id} disablePadding>
                                                <ListItemText primary={habit.name} secondary={`Racha actual: ${habit.currentStreak} días / Racha más larga: ${habit.longestStreak} días`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>Calendario de Cumplimiento (Heatmap)</Typography>
                                    <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Aquí se mostraría el heatmap de un hábito seleccionado.
                                            (Requiere una librería externa como 'react-calendar-heatmap').
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Sección de Exportación de Datos */}
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
                                                <Button 
                                                    variant="outlined" 
                                                    startIcon={<PictureAsPdfIcon />} 
                                                    onClick={() => handleExport('PDF')}
                                                >
                                                    PDF
                                                </Button>
                                                <Button 
                                                    variant="outlined" 
                                                    startIcon={<TableViewIcon />} 
                                                    onClick={() => handleExport('Excel')}
                                                >
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
