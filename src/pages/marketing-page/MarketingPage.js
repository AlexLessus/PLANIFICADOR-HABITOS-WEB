import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box'; // <-- Importa Box
import AppTheme from '../../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Features from './components/Features';
import FAQ from './components/FAQ';
import MagicBento from './MagicBento'; 
import ContactUsSection from './components/contact-us';
// import LiquidEther from './LiquidEther';

export default function MarketingPage(props) {
    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <AppAppBar />
            <Hero />
            <Box> {/* Usamos Box en lugar de <div> */}
                <Features />
                <Divider />
                <Highlights />
                <Divider />
                <FAQ />
                <Divider />
                <ContactUsSection />
            </Box>
        </AppTheme>
    );
}