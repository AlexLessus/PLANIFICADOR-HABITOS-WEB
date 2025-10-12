import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { SitemarkIcon } from './components/CustomIcons';
import authService from '../../services/authService';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const ResetPasswordContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function ResetPasswordPage(props) {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(null); // null, true, or false

    useEffect(() => {
        const verifyToken = async () => {
            try {
                await authService.verifyResetToken(token);
                setIsTokenValid(true);
            } catch (err) {
                setIsTokenValid(false);
                setMessage('El enlace de restablecimiento es inválido o ha expirado. Por favor, solicita uno nuevo.');
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setError('');

        try {
            const response = await authService.resetPassword(token, { password });
            setMessage(response.message || '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
            setIsSuccess(true);
            setTimeout(() => navigate('/signin'), 3000); // Redirige al login después de 3 segundos
        } catch (err) {
            setMessage(err.message || 'Ocurrió un error al restablecer la contraseña.');
            setIsSuccess(false);
        }
    };

    const renderContent = () => {
        if (isTokenValid === null) {
            return <Typography>Verificando enlace...</Typography>;
        }
        if (isTokenValid === false) {
            return (
                <>
                    <Typography color="error">{message}</Typography>
                    <Link component={RouterLink} to="/forgot-password">Solicitar un nuevo enlace</Link>
                </>
            );
        }
        return (
            <>
                <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
                    Restablecer Contraseña
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Introduce tu nueva contraseña.
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        name="password"
                        label="Nueva Contraseña"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="standard"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        name="confirmPassword"
                        label="Confirmar Nueva Contraseña"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="standard"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                        Guardar Contraseña
                    </Button>
                </Box>
                {message && (
                    <Typography variant="body2" sx={{ color: isSuccess ? 'green' : 'red', textAlign: 'center', mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </>
        );
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1.5rem', right: '1.5rem' }} />
            <ResetPasswordContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <SitemarkIcon sx={{ fontSize: '2rem', color: 'primary.main', centered: true }} />
                    {renderContent()}
                </Card>
            </ResetPasswordContainer>
        </AppTheme>
    );
}
