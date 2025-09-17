import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography
          gutterBottom
          variant={isSmallScreen ? 'h6' : 'h5'}
          component="div"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <InsightsRoundedIcon fontSize={isSmallScreen ? 'small' : 'medium'} />
          Habito
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Descripción breve del habito destacado.
        </Typography>
        <Button
          variant="outlined"
          size={isSmallScreen ? 'small' : 'medium'}
          endIcon={<ChevronRightRoundedIcon />}
        >
          Ver más
        </Button>
      </CardContent>
    </Card>
  );
}
