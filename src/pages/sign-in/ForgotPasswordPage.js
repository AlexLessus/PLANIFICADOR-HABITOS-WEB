import * as React from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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

const ForgotPasswordContainer = styled(Stack)(({ theme }) => ({
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

export default function ForgotPasswordPage(props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Por favor, introduce una dirección de correo válida.');
      return false;
    }
    setEmailError(false);
    setEmailErrorMessage('');
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateEmail()) {
      return;
    }

    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response.message || 'Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.');
      setIsSuccess(true);
    } catch (error) {
      // Incluso si hay un error (ej. usuario no encontrado), mostramos un mensaje genérico por seguridad
      setMessage('Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.');
      setIsSuccess(true); // Marcamos como éxito para no revelar si un email está o no registrado
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1.5rem', right: '1.5rem' }} />
      <ForgotPasswordContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <SitemarkIcon sx={{ fontSize: '2rem', color: 'primary.main', centered: true }} />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Recuperar Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              label="Correo Electrónico"
              placeholder="tu-correo@ejemplo.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="standard"
              value={email}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
            >
              Enviar enlace
            </Button>
          </Box>
          {message && (
          <Typography
            variant="body2"
            sx={{
              color: isSuccess ? 'green' : 'red',
              textAlign: 'center',
              mt: 2
            }}
          >
            {message}
          </Typography>
        )}
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component={RouterLink}
              to="/signin"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Volver a Iniciar Sesión
            </Link>
          </Typography>
        </Card>
      </ForgotPasswordContainer>
    </AppTheme>
  );
}
