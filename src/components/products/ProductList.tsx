import React from 'react';
import { Grid, Button, Box } from '@mui/material';
import { ProductCard } from './ProductCard';
import { Product } from '../../types/product';
import AddIcon from '@mui/icons-material/Add';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const ProductList = ({ products, onEdit, onDelete, onAdd }: ProductListProps) => {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Product
        </Button>
      </Box>
      <Grid container spacing={3}>
        {products?.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}; 