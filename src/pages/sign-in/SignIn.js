import * as React from 'react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from './components/ForgotPassword';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { SitemarkIcon } from './components/CustomIcons';
import { GoogleLogin } from '@react-oauth/google';

import authService from '../../services/authService';
import AuthContext from '../../context/AuthContext'; // Importar el contexto

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

const SignInContainer = styled(Stack)(({ theme }) => ({
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

export default function SignIn(props) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  const { login } = useContext(AuthContext); // Obtenemos la función de login del contexto
  const navigate = useNavigate(); // Importamos el hook para la redirección

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateInputs = () => {
    // La validación ahora usa los datos del estado
    let isValid = true;

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!formData.password || formData.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) {
      return;
    }

    try {
      await login(formData); // Llama a la función de login del contexto

      setMessage('Inicio de sesión exitoso. Redirigiendo al dashboard...');
      setIsSuccess(true);

      // Añade esta línea para redirigir al usuario
      navigate('/dashboard');

    } catch (error) {
      setMessage(error.message || 'Credenciales inválidas');
      setIsSuccess(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      // Ahora, en lugar de llamar a authService directamente,
      // llamamos a la función `login` del contexto, pasándole el token de Google.
      await login({ googleToken: credentialResponse.credential });

      setMessage('Inicio de sesión con Google exitoso. Redirigiendo...');
      setIsSuccess(true);
      navigate('/dashboard');

    } catch (error) {
      setMessage(error.message || 'Error en el inicio de sesión con Google');
      setIsSuccess(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.log('Login Failed');
    setMessage('Error en el inicio de sesión con Google');
    setIsSuccess(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1.5rem', right: '1.5rem' }} />
      <Button variant="outlined" color="secondary" href='/' sx={{ width: '8%', boxShadow: 2, fontSize: '1rem', top: '1.5rem', left: '1.5rem', position: 'fixed' }}>Regresar</Button>
      <SignInContainer direction="column" justifyContent="space-between">

        <Card variant="outlined">
          <SitemarkIcon sx={{ fontSize: '2rem', color: 'primary.main', centered: true }} />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Accede a tu cuenta para gestionar tus hábitos y rutinas diarias.
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
            <FormControl>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                label="Correo Electrónico"
                placeholder="Tigre@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="standard"
                color={emailError ? 'error' : 'primary'}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                label="Contraseña"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="standard"
                color={passwordError ? 'error' : 'primary'}
                onChange={handleChange}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recuérdame"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              Iniciar sesión
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Olvidaste tu contraseña?
            </Link>
          </Box>
          <Divider>o</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
            <Typography sx={{ textAlign: 'center' }}>
              No tienes una cuenta?{' '}
              <Link
                href="/signup"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Card>
        {message && (
          <Typography
            variant="body2"
            sx={{
              color: isSuccess ? 'green' : 'red',
              textAlign: 'center'
            }}
          >
            {message}
          </Typography>
        )}
      </SignInContainer>
    </AppTheme>
  );
}
