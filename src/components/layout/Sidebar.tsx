import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <Drawer open={open} onClose={onClose}>
      <List sx={{ width: 250 }}>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/products">
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItem>
      </List>
      <Divider />
    </Drawer>
  );
}; 