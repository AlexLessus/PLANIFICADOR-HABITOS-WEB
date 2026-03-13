import * as React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import DynamicBreadcrumbs from './DynamicBreadcrumbs';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import SearchBar from './SearchBar';
import NotificationsPanel from './NotificationsPanel';

export default function Header() {
  return (
    <>
      {/* Header Desktop */}
      <Stack
        direction="row"
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: { sm: '100%', md: '1700px' },
          pt: 1.5,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <DynamicBreadcrumbs />
        </Box>
        <Stack
          direction="row"
          sx={{
            gap: 1,
            flexShrink: 0,
          }}
        >
          <SearchBar />
          <NotificationsPanel />
          <ColorModeIconDropdown />
        </Stack>
      </Stack>

      {/* Header Tablet - Versión simplificada */}
      <Stack
        direction="row"
        sx={{
          display: { xs: 'none', sm: 'flex', md: 'none' },
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          px: 2,
        }}
      >
        <DynamicBreadcrumbs />
        <Stack direction="row" sx={{ gap: 1 }}>
          <NotificationsPanel />
          <ColorModeIconDropdown />
        </Stack>
      </Stack>
    </>
  );
}
