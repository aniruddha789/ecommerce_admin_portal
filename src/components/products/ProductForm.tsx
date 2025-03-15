import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CreateProductInput, Product } from '../../types/product';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => void;
  product?: Product;
}

export const ProductForm = ({ open, onClose, onSubmit, product }: ProductFormProps) => {
  const { control, handleSubmit } = useForm<CreateProductInput>({
    defaultValues: product || {
      name: '',
      type: '',
      brandid: '',
      description: '',
      listprice: 0,
      image: '',
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Type is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Type"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="brandid"
                control={control}
                rules={{ required: 'Brand ID is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Brand ID"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="listprice"
                control={control}
                rules={{ required: 'Price is required', min: 0 }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="List Price"
                    type="number"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Image URL"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {product ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 