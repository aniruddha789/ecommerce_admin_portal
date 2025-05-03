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
  Menu,
  MenuItem,
} from '@mui/material';
import { getAllOrders, Order, UserOrders, OrderStatus, updateOrderStatus } from '../services/api';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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

const StatusUpdateMenu: React.FC<{
  currentStatus: string;
  orderId: number;
  onStatusUpdate: (newStatus: OrderStatus) => Promise<void>;
}> = ({ currentStatus, onStatusUpdate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status: OrderStatus) => {
    setLoading(true);
    try {
      await onStatusUpdate(status);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        disabled={loading}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {Object.values(OrderStatus).map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={status === currentStatus || loading}
            sx={{
              fontWeight: status === currentStatus ? 'bold' : 'normal',
            }}
          >
            {status.replace(/_/g, ' ')}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const OrderRow: React.FC<RowProps> = ({ order, userId }) => {
  const [open, setOpen] = useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      // Trigger a refresh of the orders list
      window.location.reload(); // You might want to implement a more elegant solution
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={order.orderStatus}
              color={
                order.orderStatus === OrderStatus.DELIVERED
                  ? 'success'
                  : order.orderStatus === OrderStatus.PROCESSING
                  ? 'warning'
                  : order.orderStatus === OrderStatus.CANCELLED
                  ? 'error'
                  : order.orderStatus === OrderStatus.PAYMENT_SUCCESSFULL
                  ? 'info'
                  : 'default'
              }
            />
            <StatusUpdateMenu
              currentStatus={order.orderStatus}
              orderId={order.id}
              onStatusUpdate={handleStatusUpdate}
            />
          </Box>
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