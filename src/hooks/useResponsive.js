import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * useResponsive - Hook personalizado para detectar breakpoints
 * 
 * Proporciona utilidades para trabajar con responsive design.
 * 
 * @returns {Object} Objeto con utilidades responsive
 */
export const useResponsive = () => {
  const theme = useTheme();

  // Detectar breakpoints específicos
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  // Detectar rangos (up = mayor o igual)
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));

  // Detectar rangos (down = menor o igual)
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const isXlDown = useMediaQuery(theme.breakpoints.down('xl'));

  // Detectar si es móvil (xs o sm)
  const isMobile = isXs || isSm;
  
  // Detectar si es tablet (md)
  const isTablet = isMd;
  
  // Detectar si es desktop (lg o xl)
  const isDesktop = isLg || isXl;

  // Obtener breakpoint actual
  const getCurrentBreakpoint = () => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return 'xs';
  };

  // Detectar orientación
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');

  // Detectar preferencias del usuario
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return {
    // Breakpoints específicos
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    
    // Rangos up
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    
    // Rangos down
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    
    // Categorías
    isMobile,
    isTablet,
    isDesktop,
    
    // Utilidades
    currentBreakpoint: getCurrentBreakpoint(),
    isLandscape,
    isPortrait,
    
    // Preferencias
    prefersDarkMode,
    prefersReducedMotion,
  };
};

/**
 * useBreakpoint - Hook simplificado para obtener el breakpoint actual
 * 
 * @returns {string} Breakpoint actual ('xs', 'sm', 'md', 'lg', 'xl')
 */
export const useBreakpoint = () => {
  const { currentBreakpoint } = useResponsive();
  return currentBreakpoint;
};

/**
 * useIsMobile - Hook para detectar si es dispositivo móvil
 * 
 * @returns {boolean} true si es móvil (xs o sm)
 */
export const useIsMobile = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * useIsDesktop - Hook para detectar si es desktop
 * 
 * @returns {boolean} true si es desktop (lg o xl)
 */
export const useIsDesktop = () => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

export default useResponsive;
