import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Features from './components/Features';
import { Stepper, Step, StepLabel } from '@mui/material';

export default function MarketingPage(props) {
  const steps = ['Regístrate', 'Configura tus hábitos', 'Recibe recordatorios', 'Celebra tu progreso'];

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <AppAppBar />
      <Hero />

      <div>
        <Features />
        <Divider />
        <Highlights />
        <Divider />
        <Stepper activeStep={-1} alternativeLabel sx={{ py: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    </AppTheme>
  );
}
