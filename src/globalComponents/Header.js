import * as React from 'react';
import Stack from '@mui/material/Stack';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DynamicBreadcrumbs from './DynamicBreadcrumbs';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import MenuButton from './MenuButton';
import SearchBar from './SearchBar';
import NotificationsPanel from './NotificationsPanel';

export default function Header() {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <DynamicBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <SearchBar />
        <NotificationsPanel />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
