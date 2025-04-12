import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { CreateProductInput, Product } from '../../types/product';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageUploader } from '../ImageUploader';
import { productService } from '../../services/api';
import './ProductForm.css';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => void;
  product?: Product;
}

export const ProductForm = ({ open, onClose, onSubmit, product }: ProductFormProps) => {
  const { control, handleSubmit, setValue } = useForm<CreateProductInput>({
    defaultValues: product || {
      name: '',
      type: '',
      brandid: '',
      description: '',
      listprice: 0,
      supplierID: 0,
      image: '',
      inventory: [{
        size: '',
        color: '',
        quantity: 0,
        image: ''
      }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inventory"
  });

  const [mainImage, setMainImage] = useState<string>('');
  const [productData, setProductData] = useState({
    ...product,
    image: product?.image || '',
  });

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      setProductData({ ...productData, image: product.image });
    
    }
  }, [product]);

  const handleMainImageUploaded = (imageUrl: string) => {
    setMainImage(imageUrl);
    setValue(`image`, imageUrl);
    setProductData({ ...productData, image: imageUrl });
  };

  const handleVariationImageUploaded = (imageUrl: string, index: number) => {
    setValue(`inventory.${index}.image`, imageUrl);
  };

  const handleUpdateProduct = async () => {
    console.log('Updating product with data:', productData);
    try {
      const response = await productService.updateProduct(product.id, productData);
      console.log('Update response:', response);
      // Handle success (e.g., show a success message)
    } catch (error) {
      console.error('Update error:', error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                name="supplierID"
                control={control}
                rules={{ required: 'Supplier ID is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Supplier ID"
                    type="number"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <ImageUploader
                onImageUploaded={handleMainImageUploaded}
                currentImageUrl={mainImage || undefined}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Inventory Variations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {fields.map((field, index) => (
                <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={3}>
                    <Controller
                      name={`inventory.${index}.size`}
                      control={control}
                      rules={{ required: 'Size is required' }}
                      render={({ field, fieldState }) => (
                        <TextField {...field} label="Size" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Controller
                      name={`inventory.${index}.color`}
                      control={control}
                      rules={{ required: 'Color is required' }}
                      render={({ field, fieldState }) => (
                        <TextField {...field} label="Color" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Controller
                      name={`inventory.${index}.quantity`}
                      control={control}
                      rules={{ required: 'Quantity is required', min: 0 }}
                      render={({ field, fieldState }) => (
                        <TextField {...field} type="number" label="Quantity" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <ImageUploader
                      onImageUploaded={(url) => handleVariationImageUploaded(url, index)}
                      currentImageUrl={field.image}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    {fields.length > 1 && (
                      <IconButton onClick={() => remove(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={() => append({ size: '', color: '', quantity: 0, image: '' })}
                sx={{ mt: 1 }}
              >
                Add Variation
              </Button>
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