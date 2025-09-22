import * as React from 'react';
import { alpha } from '@mui/material/styles';// colores con transparencia
import CssBaseline from '@mui/material/CssBaseline';// restablece estilos base
import Box from '@mui/material/Box'; // contenedores flexibles
import Stack from '@mui/material/Stack'; // contenedores flexibles en stack
import AppNavbar from './components/AppNavbar'; // barra de navegación
import Header from '../../globalComponents/Header'; // encabezado de la página
import MainGrid from './components/MainGrid'; // cuadrícula principal
import SideMenu from './components/SideMenu'; // menú lateral
import AppTheme from '../shared-theme/AppTheme'; // tema personalizado
import { //estilos personalizados para componentes MUI
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = { // combinando todas las personalizaciones
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Dashboard(props) {
    return (
        //Contenedor principal del tema, se asegura de aplicar el tema a todos los componentes hijos
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme /> {/* Restablece los estilos base */}
            <Box sx={{ display: 'flex' }}>{/* Contenedor del contenido principal del layout */}
                <SideMenu />{/* Menú lateral */}
                <AppNavbar />{/* Barra de navegación */}
                {/* Contenedor del contenido principal */}
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                    })}
                >
                    {/* Contenedor del contenido principal, stack aplica verticalmente */}
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: 'center',
                            mx: 3,
                            pb: 5,
                            mt: { xs: 8, md: 0 },
                        }}
                    >
                        <Header />
                        {/*<MainGrid />*/}
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}