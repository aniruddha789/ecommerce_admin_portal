import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Pagination, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { useProducts } from '../hooks/useProducts';
import { ProductList } from '../components/products/ProductList';
import { ProductForm } from '../components/products/ProductForm';
import { Product } from '../types/product';

const PAGE_SIZE = 12;
const PRODUCT_TYPES = ['tops', 'bottoms', 'shoe', 'accessories']; // Add your product types here

export const Products = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  
  const { 
    products, 
    totalPages, 
    page, 
    setPage,
    type,
    setType, 
    isLoading, 
    error,
    createProduct,
    updateProduct,
    deleteProduct 
  } = useProducts();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(undefined);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedProduct) {
      await updateProduct({ id: selectedProduct.id, data });
    } else {
      await createProduct(data);
    }
    setIsFormOpen(false);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // API uses 0-based indexing
  };

  const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newType = event.target.value as string;
    setType(newType);
    setPage(0); // Reset to first page when changing type
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Error loading products'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={type}
            label="Filter by Type"
            onChange={handleTypeChange}
          >
            <MenuItem value="">All Types</MenuItem>
            {PRODUCT_TYPES.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page + 1} // Convert 0-based to 1-based for display
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <ProductForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
      />
    </Box>
  );
}; 