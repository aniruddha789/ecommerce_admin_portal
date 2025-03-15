import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box component="main" sx={{ 
        flexGrow: 1,
        p: 3,
        width: '100%',
        mt: 8 // Add margin-top to push content below navbar
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}; 