# 📱 Sistema de Espaciado Responsive

Documentación completa del sistema de diseño responsive implementado en la aplicación.

## 📋 Tabla de Contenidos

1. [Breakpoints](#breakpoints)
2. [Configuración Global](#configuración-global)
3. [Componentes Responsive](#componentes-responsive)
4. [Hooks Personalizados](#hooks-personalizados)
5. [Utilidades CSS](#utilidades-css)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Breakpoints

El sistema utiliza los breakpoints estándar de Material-UI:

| Breakpoint | Tamaño | Dispositivo |
|------------|--------|-------------|
| `xs` | 0px - 599px | Móviles pequeños |
| `sm` | 600px - 899px | Móviles grandes |
| `md` | 900px - 1199px | Tablets |
| `lg` | 1200px - 1535px | Desktop |
| `xl` | 1536px+ | Pantallas grandes |

---

## ⚙️ Configuración Global

### Archivo: `src/config/responsive.js`

Este archivo contiene todas las configuraciones del sistema responsive:

```javascript
import responsive from './config/responsive';

// Acceder a breakpoints
const breakpoints = responsive.breakpoints;

// Usar media queries
const mobileQuery = responsive.mediaQueries.down('sm');

// Obtener espaciado
const spacing = responsive.spacing.md;
```

### Características principales:

- **Breakpoints**: Definición de puntos de quiebre
- **Spacing**: Sistema de espaciado escalable
- **Container Max-Width**: Anchos máximos por breakpoint
- **Font Sizes**: Tamaños de fuente responsive
- **Media Queries**: Helpers para crear media queries
- **Touch Targets**: Tamaños mínimos para accesibilidad móvil

---

## 🧩 Componentes Responsive

### 1. ResponsiveContainer

Contenedor con padding y max-width adaptativos.

**Ubicación:** `src/components/ResponsiveContainer.js`

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | 'full' | false
- `disableGutters`: boolean (desactiva padding lateral)
- `sx`: objeto de estilos MUI
- `component`: elemento HTML a renderizar

**Ejemplo:**

```jsx
import ResponsiveContainer from './components/ResponsiveContainer';

function MyPage() {
  return (
    <ResponsiveContainer maxWidth="lg">
      <h1>Contenido centrado con padding responsive</h1>
    </ResponsiveContainer>
  );
}
```

### 2. ResponsiveGrid

Grid con configuración responsive predefinida.

**Ubicación:** `src/components/ResponsiveGrid.js`

**Props:**
- `spacing`: número u objeto con breakpoints
- `columns`: objeto con configuración de columnas por breakpoint
- `sx`: objeto de estilos MUI

**Ejemplo:**

```jsx
import ResponsiveGrid from './components/ResponsiveGrid';

function ProductGrid() {
  return (
    <ResponsiveGrid
      spacing={{ xs: 2, sm: 3, md: 4 }}
      columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
    >
      <ProductCard />
      <ProductCard />
      <ProductCard />
    </ResponsiveGrid>
  );
}
```

### 3. ResponsiveStack

Stack con espaciado responsive automático.

**Ubicación:** `src/components/ResponsiveStack.js`

**Props:**
- `direction`: 'row' | 'column' | objeto con breakpoints
- `spacing`: número u objeto con breakpoints
- `sx`: objeto de estilos MUI

**Ejemplo:**

```jsx
import ResponsiveStack from './components/ResponsiveStack';

function Form() {
  return (
    <ResponsiveStack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 2, md: 3 }}
    >
      <TextField label="Nombre" />
      <TextField label="Apellido" />
    </ResponsiveStack>
  );
}
```

---

## 🪝 Hooks Personalizados

### useResponsive

Hook completo con todas las utilidades responsive.

**Ubicación:** `src/hooks/useResponsive.js`

**Retorna:**

```javascript
{
  // Breakpoints específicos
  isXs, isSm, isMd, isLg, isXl,
  
  // Rangos (up = mayor o igual)
  isSmUp, isMdUp, isLgUp, isXlUp,
  
  // Rangos (down = menor o igual)
  isSmDown, isMdDown, isLgDown, isXlDown,
  
  // Categorías
  isMobile,    // xs o sm
  isTablet,    // md
  isDesktop,   // lg o xl
  
  // Utilidades
  currentBreakpoint,  // 'xs', 'sm', 'md', 'lg', 'xl'
  isLandscape,
  isPortrait,
  
  // Preferencias del usuario
  prefersDarkMode,
  prefersReducedMotion,
}
```

**Ejemplo:**

```jsx
import { useResponsive } from './hooks/useResponsive';

function MyComponent() {
  const { isMobile, isDesktop, currentBreakpoint } = useResponsive();
  
  return (
    <div>
      {isMobile && <MobileMenu />}
      {isDesktop && <DesktopMenu />}
      <p>Breakpoint actual: {currentBreakpoint}</p>
    </div>
  );
}
```

### Hooks Simplificados

```jsx
import { useIsMobile, useIsDesktop, useBreakpoint } from './hooks/useResponsive';

// Detectar si es móvil
const isMobile = useIsMobile();

// Detectar si es desktop
const isDesktop = useIsDesktop();

// Obtener breakpoint actual
const breakpoint = useBreakpoint(); // 'xs', 'sm', 'md', 'lg', 'xl'
```

---

## 🎨 Utilidades CSS

### Clases de Visibilidad

**Ocultar en breakpoints específicos:**

```html
<div className="hide-xs">Oculto en móviles pequeños</div>
<div className="hide-sm">Oculto en móviles grandes</div>
<div className="hide-md">Oculto en tablets</div>
<div className="hide-lg">Oculto en desktop</div>
```

**Mostrar solo en breakpoints específicos:**

```html
<div className="show-xs-only">Solo visible en xs</div>
<div className="show-sm-only">Solo visible en sm</div>
<div className="show-md-only">Solo visible en md</div>
```

### Contenedor Fluido

```html
<div className="container-fluid">
  Contenedor con padding responsive automático
</div>
```

### Tablas Responsive

```html
<div className="table-responsive">
  <table>
    <!-- Contenido de la tabla -->
  </table>
</div>
```

### Accesibilidad

```html
<!-- Ocultar visualmente pero mantener para lectores de pantalla -->
<span className="sr-only">Texto para lectores de pantalla</span>
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Página con Layout Responsive

```jsx
import ResponsiveContainer from './components/ResponsiveContainer';
import ResponsiveStack from './components/ResponsiveStack';
import { useIsMobile } from './hooks/useResponsive';

function HomePage() {
  const isMobile = useIsMobile();
  
  return (
    <ResponsiveContainer maxWidth="lg">
      <ResponsiveStack spacing={{ xs: 3, md: 5 }}>
        <h1>Bienvenido</h1>
        
        {isMobile ? (
          <MobileNavigation />
        ) : (
          <DesktopNavigation />
        )}
        
        <MainContent />
      </ResponsiveStack>
    </ResponsiveContainer>
  );
}
```

### Ejemplo 2: Grid de Tarjetas

```jsx
import ResponsiveGrid from './components/ResponsiveGrid';
import { Card } from '@mui/material';

function CardGrid({ items }) {
  return (
    <ResponsiveGrid
      spacing={{ xs: 2, sm: 3, md: 4 }}
      columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
    >
      {items.map(item => (
        <Card key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </Card>
      ))}
    </ResponsiveGrid>
  );
}
```

### Ejemplo 3: Formulario Responsive

```jsx
import { Box, TextField, Button } from '@mui/material';
import ResponsiveStack from './components/ResponsiveStack';

function ContactForm() {
  return (
    <Box
      component="form"
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: '500px' },
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <ResponsiveStack spacing={{ xs: 2, md: 3 }}>
        <TextField fullWidth label="Nombre" />
        <TextField fullWidth label="Email" />
        <TextField fullWidth multiline rows={4} label="Mensaje" />
        
        <Button
          variant="contained"
          fullWidth
          sx={{
            height: { xs: 48, md: 56 },
            fontSize: { xs: '0.875rem', md: '1rem' },
          }}
        >
          Enviar
        </Button>
      </ResponsiveStack>
    </Box>
  );
}
```

### Ejemplo 4: Usando MUI sx prop con Breakpoints

```jsx
import { Box, Typography } from '@mui/material';

function HeroSection() {
  return (
    <Box
      sx={{
        // Padding responsive
        p: { xs: 2, sm: 3, md: 4, lg: 5 },
        
        // Margin responsive
        my: { xs: 3, md: 6 },
        
        // Display responsive
        display: { xs: 'block', md: 'flex' },
        
        // Flex direction responsive
        flexDirection: { md: 'row', lg: 'row-reverse' },
        
        // Gap responsive
        gap: { xs: 2, md: 4 },
        
        // Background color responsive (opcional)
        bgcolor: { xs: 'grey.100', md: 'transparent' },
      }}
    >
      <Typography
        variant="h1"
        sx={{
          // Font size responsive
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          
          // Text align responsive
          textAlign: { xs: 'center', md: 'left' },
          
          // Line height responsive
          lineHeight: { xs: 1.2, md: 1.4 },
        }}
      >
        Título Responsive
      </Typography>
    </Box>
  );
}
```

---

## ✅ Mejores Prácticas

### 1. **Usa Mobile-First**

Diseña primero para móviles y luego escala hacia arriba:

```jsx
// ✅ Correcto - Mobile first
sx={{
  fontSize: '1rem',           // Base (móvil)
  md: { fontSize: '1.25rem' }, // Tablet
  lg: { fontSize: '1.5rem' },  // Desktop
}}

// ❌ Incorrecto - Desktop first
sx={{
  fontSize: '1.5rem',
  md: { fontSize: '1.25rem' },
  xs: { fontSize: '1rem' },
}}
```

### 2. **Usa Unidades Relativas**

Prefiere `rem`, `em`, `%` sobre `px`:

```jsx
// ✅ Correcto
sx={{ padding: '1rem', fontSize: '1.25rem' }}

// ❌ Evitar
sx={{ padding: '16px', fontSize: '20px' }}
```

### 3. **Mantén Consistencia en Espaciado**

Usa el sistema de espaciado de MUI (múltiplos de 8px):

```jsx
// ✅ Correcto - Usa el sistema de espaciado
sx={{ p: 2, m: 3, gap: 1 }} // 16px, 24px, 8px

// ❌ Evitar valores arbitrarios
sx={{ padding: '17px', margin: '23px' }}
```

### 4. **Optimiza Imágenes**

```jsx
// ✅ Correcto - Imágenes responsive
<Box
  component="img"
  src="/image.jpg"
  alt="Descripción"
  sx={{
    width: '100%',
    height: 'auto',
    maxWidth: { xs: '100%', md: '500px' },
  }}
/>
```

### 5. **Touch Targets Mínimos**

Asegura que los elementos interactivos tengan al menos 44x44px en móviles:

```jsx
// ✅ Correcto
<Button
  sx={{
    minHeight: 44,
    minWidth: 44,
    px: 2,
  }}
>
  Click
</Button>
```

### 6. **Prueba en Dispositivos Reales**

- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPad (768px)
- Desktop (1920px)

### 7. **Considera la Orientación**

```jsx
const isLandscape = useMediaQuery('(orientation: landscape)');

return (
  <Box
    sx={{
      height: isLandscape ? '80vh' : '100vh',
    }}
  >
    Contenido
  </Box>
);
```

### 8. **Accesibilidad**

- Usa `prefers-reduced-motion` para animaciones
- Mantén contraste de color adecuado
- Proporciona textos alternativos
- Asegura navegación por teclado

```jsx
import { useResponsive } from './hooks/useResponsive';

function AnimatedComponent() {
  const { prefersReducedMotion } = useResponsive();
  
  return (
    <Box
      sx={{
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
      }}
    >
      Contenido
    </Box>
  );
}
```

---

## 🚀 Checklist de Implementación

- [x] ✅ Meta viewport configurado
- [x] ✅ Sistema de breakpoints definido
- [x] ✅ CSS base responsive implementado
- [x] ✅ Componentes responsive creados
- [x] ✅ Hooks personalizados disponibles
- [x] ✅ Utilidades CSS agregadas
- [x] ✅ Touch targets configurados
- [x] ✅ Imágenes responsive
- [x] ✅ Tablas responsive
- [x] ✅ Accesibilidad implementada
- [ ] ⏳ Menú móvil implementado (pendiente)
- [ ] ⏳ Testing en dispositivos reales (pendiente)

---

## 📚 Recursos Adicionales

- [Material-UI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev - Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)

---

**Última actualización:** Noviembre 2025
