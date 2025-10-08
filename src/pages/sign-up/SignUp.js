import * as React from 'react';
import { useState, useContext } from 'react'; // Importar useContext
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { SitemarkIcon } from './components/CustomIcons';
import { GoogleLogin } from '@react-oauth/google'; // Importar GoogleLogin

import authService from '../../services/authService';
import AuthContext from '../../context/AuthContext'; // Importar el contexto
import IconButton from '@mui/material/IconButton';


const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');


  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { login } = useContext(AuthContext); // Obtenemos la función de login del contexto
  const navigate = useNavigate();

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

    if (!formData.first_name || formData.first_name.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }

    try {
      const response = await authService.register(formData);

      setMessage(response.message);
      setIsSuccess(true);

      // Redirige al usuario a la página de login después de un registro exitoso
      setTimeout(() => {
        navigate('/signin');
      }, 2000);

    } catch (error) {
      setMessage(error.message || 'Ocurrió un error inesperado. Intenta de nuevo.');
      setIsSuccess(false);
    }
  };

  // Funciones para el login con Google (copiadas de SignIn.js)
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
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

      <SignUpContainer direction="column" justifyContent="space-between" sx={{ mt: -4 }}>
        <Card variant='outlined'>
          <SitemarkIcon sx={{ fontSize: '2rem', color: 'primary.main', centered: 'true' }} />
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Regístrate
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: -3 }}>
            Crea una cuenta para empezar a organizar tus hábitos.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 0, display: 'flex', flexDirection: 'column', gap: .3 }}>
            <TextField margin="normal" variant='standard' required fullWidth id="first_name" label="Nombre" name="first_name" autoComplete="given-name" autoFocus onChange={handleChange} />
            <TextField margin="normal" variant='standard' required fullWidth id="last_name" label="Apellido" name="last_name" autoComplete="family-name" onChange={handleChange} />
            <TextField margin="normal" variant='standard' required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" onChange={handleChange} />
            <TextField margin="normal" variant='standard' required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="new-password" onChange={handleChange} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }}>
              Registrarse
            </Button>
          </Box>
          <Divider>o continúa con</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', mt: 0.4 }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
            <Typography sx={{ textAlign: 'center' }}>
              ¿Ya tienes una cuenta?{' '}
              <Link href="/signin" variant="body2">
                Inicia sesión
              </Link>
            </Typography>
          </Box>
        </Card>
        {message && (
          <Typography variant="body2" sx={{ color: isSuccess ? 'green' : 'red', textAlign: 'center', mt: 2 }}>
            {message}
          </Typography>
        )}
      </SignUpContainer>
    </AppTheme>
  );
}
