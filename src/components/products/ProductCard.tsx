import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);

  return (
    <Card>
      <CardMedia
        component="img"
        height="250"
        image={product.image || 'https://via.placeholder.com/140'}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {product.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="primary">
            ${product.listprice}
          </Typography>
          <Typography variant="body2">Type: {product.type}</Typography>
          <Typography variant="body2">Total Stock: {totalStock}</Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onEdit(product)}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={() => onDelete(product.id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}; 