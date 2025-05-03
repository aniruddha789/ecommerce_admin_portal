import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  IconButton,
  Grid,
} from '@mui/material';
import { getAllOrders, Order, UserOrders } from '../services/api';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';

interface RowProps {
  order: Order;
  userId: number;
}

const AddressDisplay: React.FC<{ address: Order['address'] }> = ({ address }) => {
  if (!address) return null;

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <LocationOnIcon sx={{ mr: 1 }} /> Delivery Address
      </Typography>
      <Box sx={{ pl: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {address.addressType}
        </Typography>
        <Typography variant="body2">
          {address.addressLine1}
          {address.addressLine2 && <>, {address.addressLine2}</>}
        </Typography>
        <Typography variant="body2">
          {address.city}, {address.district}
        </Typography>
        <Typography variant="body2">
          {address.state}, {address.country} - {address.pincode}
        </Typography>
      </Box>
    </Box>
  );
};

const OrderRow: React.FC<RowProps> = ({ order, userId }) => {
  const [open, setOpen] = useState(false);

  const getCondensedAddress = (address: Order['address']) => {
    if (!address) return <Typography color="text.secondary">No Address</Typography>;
    return (
      <Typography variant="body2" noWrap>
        {address.addressLine1}, {address.city}, {address.pincode}
      </Typography>
    );
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{order.id}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, fontSize: '1rem' }} />
            User {userId}
          </Box>
        </TableCell>
        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
        <TableCell>
          <Chip
            label={order.orderStatus}
            color={
              order.orderStatus === 'COMPLETED'
                ? 'success'
                : order.orderStatus === 'PENDING'
                ? 'warning'
                : order.orderStatus === 'CANCELLED'
                ? 'error'
                : order.orderStatus === 'PAYMENT_SUCCESSFULL'
                ? 'info'
                : 'default'
            }
          />
        </TableCell>
        <TableCell sx={{ maxWidth: 200 }}>
          {getCondensedAddress(order.address)}
        </TableCell>
        <TableCell>
          ${order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Grid container spacing={2}>
                {order.address && (
                  <Grid item xs={12}>
                    <AddressDisplay address={order.address} />
                  </Grid>
                )}
                {order.orderItems.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom component="div">
                      Order Items
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product ID</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productId}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.size}</TableCell>
                            <TableCell>{item.color || '-'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price}</TableCell>
                            <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Orders: React.FC = () => {
  const [userOrders, setUserOrders] = useState<UserOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getAllOrders();
        setUserOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Flatten the orders array and filter out empty orders
  const allOrders = userOrders.flatMap(userOrder => 
    userOrder.orders.map(order => ({ ...order, userId: userOrder.userId }))
  ).filter(order => order.orderItems.length > 0);

  if (!allOrders.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No orders found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        All Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Order ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivery Address</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allOrders.map((order) => (
              <OrderRow key={order.id} order={order} userId={order.userId} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders; 