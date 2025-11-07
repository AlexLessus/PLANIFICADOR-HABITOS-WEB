import { useState, useEffect } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import welcomeImage from '../../../assets/pets/tutorial.png';
import taskImage from '../../../assets/pets/tutorial_tareas.png';
import dashboardImage from '../../../assets/pets/tutorial_dashboard.png';
import progressImage from '../../../assets/pets/tutorial_progreso.png';
import calendarImage from '../../../assets/pets/tutorial_calendario.png';
import habitImage from '../../../assets/pets/tutorial_habitos.png';
import settingImage from '../../../assets/pets/tutorial_ajustes.png';
import notifyImage from '../../../assets/pets/tutorial_notificaciones.png';

const TutorialTour = () => {
    const [run, setRun] = useState(false);
    const theme = useTheme();
    const location = useLocation();

    useEffect(() => {
        // Verificar si el usuario ya vio el tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');

        // SOLO iniciar en el dashboard
        if (!hasSeenTutorial && location.pathname === '/dashboard') {
            // Esperar 1 segundo antes de iniciar el tour (para que cargue todo)
            setTimeout(() => setRun(true), 1000);
        }
    }, [location.pathname]);

    // Define los pasos del tutorial
    const steps = [
        {
            target: 'body',
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <img
                        src={welcomeImage}
                        alt="Bienvenida"
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                    <p>¡Bienvenido a Tiger Habit Planner!<br /> Te mostraremos las funciones principales de la aplicación.</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.MuiDrawer-root .MuiList-root', // Menu lateral
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>Aquí encontrarás un vistazo general de todas las opciones, ademas de algunas estadisticas.</p>
                    <img
                        src={dashboardImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'a[href="/habits"]', // Opción de Hábitos
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>En "Hábitos" puedes crear, editar o borrar tus hábitos diarios. Conforme vayas haciendolos, tu racha irá aumentando.</p>
                    <img
                        src={habitImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'a[href="/tasks"]', // Opción de Tareas
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>En "Tareas" puedes crear, editar o borar tus tareas, además podrás crear tareas recurrentes, genial para tareas repetitivas.</p>
                    <img
                        src={taskImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'a[href="/calendar"]', // Opción de Calendario
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>El "Calendario" te muestra una vista completa tareas organizadas por fecha.</p>
                    <img
                        src={calendarImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'right',
        },
        {
            target: 'a[href="/progress"]', // Opción de Progreso
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>En "Progreso" encontrarás estadísticas detalladas y gráficas de tu desempeño. Además de una opción para exportar tus hábitos y tareas.</p>
                    <img
                        src={progressImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'right',
        },
        {
            target: '[aria-label="notificaciones"]', // Botón de notificaciones
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>Aquí verás notificaciones importantes como tareas próximas a vencer y recordatorios de hábitos.</p>
                    <img
                        src={notifyImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'bottom',
        },
        {

            target: '.css-bywlky-MuiStack-root', // Avatar y opciones
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <p>Desde aquí puedes acceder a tu perfil, configuración y cerrar sesión.</p>
                    <img
                        src={settingImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                </div>
            ),
            placement: 'top',
        },
        {
            target: 'body',
            content: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <img
                        src={welcomeImage}
                        style={{
                            width: '120px',
                            height: 'auto',
                            flexShrink: 0
                        }}
                    />
                    <p>¡Listo! Ya conoces las funciones básicas. ¡Comienza a crear tus hábitos y tareas! No olvides mantener a tu tigre feliz.</p>
                </div>
            ),
            placement: 'center',
        },
    ];

    const handleJoyrideCallback = (data) => {
        const { status, action, type } = data;

        // Cuando el usuario termina o salta el tutorial
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            localStorage.setItem('hasSeenTutorial', 'true');
            setRun(false);
        }

        // Si el usuario hace clic fuera (cierra el tooltip)
        if (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) {
            localStorage.setItem('hasSeenTutorial', 'true');
            setRun(false);
        }
    };

    // Función para reiniciar el tutorial (puedes llamarla desde cualquier parte)
    window.restartTutorial = () => {
        localStorage.removeItem('hasSeenTutorial');
        setRun(true);
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            spotlightClicks={false}
            disableScrolling={false}
            callback={handleJoyrideCallback}
            locale={{
                back: 'Atrás',
                close: 'Cerrar',
                last: 'Finalizar',
                next: 'Siguiente',
                skip: 'Saltar tutorial',
            }}
            styles={{
                options: {
                    primaryColor: theme.palette.primary.main,
                    zIndex: 10000,
                    backgroundColor: theme.palette.background.paper,
                    textColor: theme.palette.text.primary,
                    overlayColor: 'rgba(0, 0, 0, 0.8)',
                    arrowColor: theme.palette.background.paper,
                    beaconSize: 36,
                },
                tooltip: {
                    borderRadius: 8,
                    fontSize: 14,
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                buttonNext: {
                    backgroundColor: theme.palette.primary.main,
                    fontSize: 14,
                    borderRadius: 4,
                },
                buttonBack: {
                    color: theme.palette.text.secondary,
                    fontSize: 14,
                },
                buttonSkip: {
                    color: theme.palette.text.secondary,
                    fontSize: 14,
                },
            }}
        />
    );
};

export default TutorialTour;