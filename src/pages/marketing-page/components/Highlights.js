import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles'; 
// ELIMINAMOS: import LiquidEther from '../LiquidEther'; 
//estilo de animacion para el cursor y componentes
import GlowCard from './GlowCard';

// ... Importaciones de Iconos
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ErrorIcon from '@mui/icons-material/Error';


const items = [
    {
        icon: <CrisisAlertIcon />,
        title: 'Empieza con un hábito tan pequeño que no puedas decir que no.',
        description:
            'La "Regla de los Dos Minutos" sugiere que todo gran hábito comienza con una versión de dos minutos. Nuestra aplicación te permite definir metas mínimas y flexibles, adaptándose a tu energía y tiempo disponible. ¿No puedes leer un capítulo? Lee una página. ¿No puedes correr 5 km? Ponte las zapatillas.',
    },
    {
        icon: <TrendingUpIcon />,
        title: 'Los hábitos son el interés compuesto de la superación personal.',
        description:
            'Los efectos de tus hábitos se multiplican a medida que los repites. Nuestra plataforma está diseñada para ser tu compañera a largo plazo, registrando tu progreso y mostrándote cómo tus pequeñas victorias diarias se convierten en logros masivos con el tiempo.',
    },
    {
        icon: <RocketLaunchIcon />,
        title: 'Hazlo obvio, hazlo atractivo, hazlo sencillo, hazlo satisfactorio.',
        description:
            'Nuestra interfaz intuitiva se enfoca en eliminar la fricción (hacerlo sencillo), mientras que el seguimiento de rachas y los recordatorios visuales hacen que el progreso sea gratificante (hacerlo satisfactorio). Cada interacción está pensada para que seguir tus hábitos se sienta como un logro.',
    },
    {
        icon: <ErrorIcon />,
        title: 'Nunca dejes de hacer un hábito dos veces.',
        description:
            'Todos fallamos un día, lo importante es volver al camino correcto lo antes posible. Te ayudamos a crear una visión clara de tu progreso permitiéndote identificar rápidamente si te estás desviando y ayudándote a retomar tu racha. Un solo tropiezo no define tu viaje.',
    },
    {
        icon: <TipsAndUpdatesIcon />,
        title: 'La mejor manera de cambiar tu comportamiento es cambiar tu entorno.',
        description:
            'Nuestra aplicación te ayuda a diseñar un "entorno digital" que trabaje a tu favor. Con la "intención de implementación", puedes planificar no solo qué hábito harás, sino cuándo y dónde. Al recibir un recordatorio en el momento y lugar correctos, la probabilidad de que actúes se dispara.',
    },
    {
        icon: <QueryStatsRoundedIcon />,
        title: 'Los profesionales se ciñen a su programa, los aficionados se dejan llevar por la inspiración.',
        description:
            'Los pequeños detalles marcan la diferencia. Desde la personalización de tus recordatorios hasta el análisis detallado de tus estadísticas, cada función está diseñada para que dejes de depender de la motivación y empieces a operar con un sistema.',
    },
];


export default function Highlights() {
    return (
        <Box
            id="highlights"
            sx={{
                pt: { xs: 4, sm: 12 },
                pb: { xs: 8, sm: 16 },

                bgcolor: 'transparent', // Mantener transparente por si se usa otro fondo
                color: 'white',
            }}
        >
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: { xs: 3, sm: 6 },
                }}
            >

                <Box
                    sx={{
                        width: { sm: '100%', md: '60%' },
                        textAlign: { sm: 'left', md: 'center' },
                    }}
                >
                    <Typography component="h1" variant="h3" gutterBottom>
                        El sorprendente poder de los habitos
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'grey.400', fontSize: 16 }}>
                        Descubre cómo pequeños cambios pueden transformar tu vida diaria y ayudarte a
                        alcanzar tus metas con nuestro planificador de hábitos y tareas. Nuestra aplicación
                        no es solo una lista de pendientes, es una herramienta diseñada con la ciencia del
                        comportamiento para hacer que el éxito sea inevitable.
                    </Typography>
                </Box>



                <Grid container spacing={2}>
                    {items.map((item, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <GlowCard
                                direction="column"
                                component={Card}
                                spacing={1}
                                useFlexGap
                                sx={(theme) => ({
                                    color: 'inherit',
                                    p: 3,
                                    height: '100%',
                                    borderColor: 'hsla(220, 25%, 25%, 0.3)',
                                    // Mantiene la semitransparencia para que el fondo (aunque sea blanco)
                                    // tenga un color sutil y no sea totalmente opaco.
                                    backgroundColor: alpha(theme.palette.grey[800], 0.8),
                                })}
                            >
                                <Box sx={{ opacity: '70%', fontSize: 'large' }}>{item.icon}</Box>
                                <div>
                                    <Typography gutterBottom sx={{ fontWeight: 'medium', fontSize: 16 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'grey.400', fontSize: 14 }}>
                                        {item.description}
                                    </Typography>
                                </div>
                            </GlowCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}