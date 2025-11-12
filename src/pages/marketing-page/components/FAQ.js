import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
  const [expanded, setExpanded] = React.useState([]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(
      isExpanded ? [...expanded, panel] : expanded.filter((item) => item !== panel),
    );
  };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        sx={{
          color: 'text.primary',
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        Preguntas Frecuentes
      </Typography>
      
      {/* Aumentamos el ancho de la "tabla" al 100% */}
      <Box sx={{ width: '100%', maxWidth: '900px' }}> 
        
        {/* -------------------- PREGUNTA 1 -------------------- */}
        <Accordion
          expanded={expanded.includes('panel1')}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography component="span" variant="h6"> {/* Aumentado de subtitle2 a h6 */}
              ¿Cómo puedo contactar a soporte si tengo dudas o algún problema?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1" // Aumentado de body2 a body1
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '90%' } }} // Aumentado el ancho de la respuesta
            >
              Puedes contactar a nuestro equipo de soporte al correo electrónico&nbsp;
              <Link href="mailto:equipotigertech@gmail.com">equipotigertech@gmail.com</Link>
              &nbsp; Asistiremos tu duda lo antes posible.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        {/* -------------------- PREGUNTA 2 -------------------- */}
        <Accordion
          expanded={expanded.includes('panel2')}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2d-content"
            id="panel2d-header"
          >
            <Typography component="span" variant="h6"> {/* Aumentado de subtitle2 a h6 */}
              ¿La web tiene una version de paga?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1" // Aumentado de body2 a body1
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '90%' } }}
            >
              ¡Absolutamente! Ofrecemos una version mejorada de nuestros servcicio de gestor de habitos. Si no
              estás completamente satisfecho(a), puedes devolver el producto dentro de [30]
              días para un reembolso completo o un cambio.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        {/* -------------------- PREGUNTA 3 -------------------- */}
        <Accordion
          expanded={expanded.includes('panel3')}
          onChange={handleChange('panel3')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3d-content"
            id="panel3d-header"
          >
            <Typography component="span" variant="h6"> {/* Aumentado de subtitle2 a h6 */}
              ¿Qué hace que su producto se destaque de otros en el mercado?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1" // Aumentado de body2 a body1
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '90%' } }}
            >
              Nuestro producto se distingue por su adaptabilidad, dinamismo
              y características innovadoras enfocadas en el comportamiento que te ayudaran a alcanzar tus metas. Priorizamos la satisfacción del usuario y
              nos esforzamos continuamente por superar las expectativas en todos los aspectos.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        {/* -------------------- PREGUNTA 4 -------------------- */}
        <Accordion
          expanded={expanded.includes('panel4')}
          onChange={handleChange('panel4')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4d-content"
            id="panel4d-header"
          >
            <Typography component="span" variant="h6"> {/* Aumentado de subtitle2 a h6 */}
              ¿Cómo puedo restablecer mi contraseña?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1" // Aumentado de body2 a body1
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '90%' } }}
            >
              ¡No te preocupes! Puedes restablecer tu contraseña fácilmente siguiendo estos pasos:
              Dirígete a la página de "Iniciar Sesión".
              Justo debajo del formulario de inicio de sesión, haz clic en el enlace que dice "¿Olvidaste tu contraseña?" o "Restablecer contraseña".
              Introduce la dirección de correo electrónico con la que te registraste en tu cuenta.
              Haz clic en el botón "Enviar".
              Revisa tu bandeja de entrada. Te enviaremos un correo electrónico con un enlace e instrucciones para crear tu nueva contraseña.
              Nota importante: Si no ves el correo en tu bandeja de entrada principal después de unos minutos, por favor revisa tu carpeta de Spam o Correo no deseado.
              Si sigues teniendo problemas, no dudes en contactar con nuestro equipo de soporte en&nbsp;
              <Link href="mailto:equipotigertech@gmail.com">equipotigertech@gmail.com</Link>
              &nbsp;.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}