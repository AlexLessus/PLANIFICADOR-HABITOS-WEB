/**
 * Sistema de Espaciado Responsive
 * 
 * Define breakpoints, espaciados y utilidades para mantener
 * consistencia responsive en toda la aplicación.
 */

// Breakpoints estándar (coinciden con MUI)
export const breakpoints = {
  xs: 0,      // Móviles pequeños
  sm: 600,    // Móviles grandes
  md: 900,    // Tablets
  lg: 1200,   // Desktop
  xl: 1536,   // Pantallas grandes
};

// Sistema de espaciado base (en rem)
export const spacing = {
  xs: {
    xxs: '0.25rem',  // 4px
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  sm: {
    xxs: '0.25rem',  // 4px
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.25rem',   // 20px
    lg: '2rem',      // 32px
    xl: '2.5rem',    // 40px
    xxl: '4rem',     // 64px
  },
  md: {
    xxs: '0.5rem',   // 8px
    xs: '0.75rem',   // 12px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2.5rem',    // 40px
    xl: '3rem',      // 48px
    xxl: '5rem',     // 80px
  },
  lg: {
    xxs: '0.5rem',   // 8px
    xs: '1rem',      // 16px
    sm: '1.5rem',    // 24px
    md: '2rem',      // 32px
    lg: '3rem',      // 48px
    xl: '4rem',      // 64px
    xxl: '6rem',     // 96px
  },
};

// Tamaños de contenedor máximos
export const containerMaxWidth = {
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  xxl: '1320px',
};

// Padding lateral del contenedor por breakpoint
export const containerPadding = {
  xs: '1rem',      // 16px
  sm: '1.5rem',    // 24px
  md: '2rem',      // 32px
  lg: '2rem',      // 32px
  xl: '2rem',      // 32px
};

// Utilidades para MUI sx prop
export const responsiveSpacing = {
  // Padding responsive
  padding: {
    xs: { xs: 1, sm: 2, md: 3 },
    sm: { xs: 2, sm: 3, md: 4 },
    md: { xs: 3, sm: 4, md: 5 },
    lg: { xs: 4, sm: 5, md: 6 },
  },
  
  // Margin responsive
  margin: {
    xs: { xs: 1, sm: 2, md: 3 },
    sm: { xs: 2, sm: 3, md: 4 },
    md: { xs: 3, sm: 4, md: 5 },
    lg: { xs: 4, sm: 5, md: 6 },
  },
  
  // Gap responsive (para flexbox/grid)
  gap: {
    xs: { xs: 1, sm: 1.5, md: 2 },
    sm: { xs: 1.5, sm: 2, md: 2.5 },
    md: { xs: 2, sm: 2.5, md: 3 },
    lg: { xs: 2.5, sm: 3, md: 4 },
  },
};

// Tamaños de fuente responsive
export const fontSizes = {
  h1: {
    xs: '2rem',      // 32px
    sm: '2.5rem',    // 40px
    md: '3rem',      // 48px
    lg: '3.5rem',    // 56px
  },
  h2: {
    xs: '1.75rem',   // 28px
    sm: '2rem',      // 32px
    md: '2.5rem',    // 40px
    lg: '3rem',      // 48px
  },
  h3: {
    xs: '1.5rem',    // 24px
    sm: '1.75rem',   // 28px
    md: '2rem',      // 32px
    lg: '2.25rem',   // 36px
  },
  h4: {
    xs: '1.25rem',   // 20px
    sm: '1.5rem',    // 24px
    md: '1.75rem',   // 28px
    lg: '2rem',      // 32px
  },
  h5: {
    xs: '1.125rem',  // 18px
    sm: '1.25rem',   // 20px
    md: '1.5rem',    // 24px
    lg: '1.5rem',    // 24px
  },
  h6: {
    xs: '1rem',      // 16px
    sm: '1.125rem',  // 18px
    md: '1.25rem',   // 20px
    lg: '1.25rem',   // 20px
  },
  body1: {
    xs: '0.875rem',  // 14px
    sm: '1rem',      // 16px
    md: '1rem',      // 16px
    lg: '1rem',      // 16px
  },
  body2: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '0.875rem',  // 14px
    lg: '0.875rem',  // 14px
  },
};

// Media queries helpers
export const mediaQueries = {
  up: (breakpoint) => `@media (min-width: ${breakpoints[breakpoint]}px)`,
  down: (breakpoint) => `@media (max-width: ${breakpoints[breakpoint] - 1}px)`,
  between: (min, max) => 
    `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`,
  only: (breakpoint) => {
    const keys = Object.keys(breakpoints);
    const index = keys.indexOf(breakpoint);
    if (index === keys.length - 1) {
      return `@media (min-width: ${breakpoints[breakpoint]}px)`;
    }
    return `@media (min-width: ${breakpoints[breakpoint]}px) and (max-width: ${breakpoints[keys[index + 1]] - 1}px)`;
  },
};

// Utilidad para obtener valor responsive
export const getResponsiveValue = (values) => {
  if (typeof values === 'object') {
    return values;
  }
  return { xs: values };
};

// Touch targets mínimos (accesibilidad móvil)
export const touchTarget = {
  minHeight: '44px',
  minWidth: '44px',
};

export default {
  breakpoints,
  spacing,
  containerMaxWidth,
  containerPadding,
  responsiveSpacing,
  fontSizes,
  mediaQueries,
  getResponsiveValue,
  touchTarget,
};
