import { useState, useEffect } from 'react';
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
  Box,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { CreateProductInput, Product } from '../../types/product';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { MultiImageUploader } from '../MultiImageUploader';
import './ProductForm.css';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => void;
  product?: Product;
  refetch: () => void;
}

export const ProductForm = ({ open, onClose, onSubmit, product, refetch }: ProductFormProps) => {
  const { control, handleSubmit, setValue, reset } = useForm<CreateProductInput>({
    defaultValues: product || {
      name: '',
      type: '',
      brandid: '',
      description: '',
      listprice: 0,
      supplierID: 0,
      image: '',
      inventory: [],
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

  // State to control the visibility of inventory section
  const [showInventory, setShowInventory] = useState(false);

// In ProductForm component:
useEffect(() => {
  if (product) {
    setMainImage(product.image || '');
    setProductData({ ...product, image: product.image || '' });
    // If editing a product with existing inventory, show the inventory section
    if (product.inventory && product.inventory.length > 0) {
      setShowInventory(true);
    } else {
      setShowInventory(false);
    }
    reset(product); // Reset form with product data
  } else {
    // Reset to empty form when adding a new product
    setMainImage('');
    setProductData({
      name: '',
      type: '',
      brandid: '',
      description: '',
      listprice: 0,
      supplierID: 0,
      image: '',
      inventory: []
    });
    setShowInventory(false);
    reset({
      name: '',
      type: '',
      brandid: '',
      description: '',
      listprice: 0,
      supplierID: 0,
      image: '',
      inventory: []
    });
  }
}, [product, reset]);

  const handleMainImageUploaded = (imageUrl: string) => {
    setMainImage(imageUrl);
    setValue(`image`, imageUrl);
    setProductData({ ...productData, image: imageUrl });
  };


   // Function to update a specific variation's image URLs
   const handleImagesUploaded = (variationIndex: number, imageUrls: string) => {
    
    setValue(`inventory.${variationIndex}.image`, imageUrls);

  };


  const handleFormSubmit = async (data: CreateProductInput) => {
    // Filter out inventory items that do not have valid values
    const inventory = data.inventory.filter(item => 
      item.size.trim() !== '' && 
      item.color.trim() !== '' && 
      item.quantity > 0 && 
      item.image.trim() !== ''
    );

    // Concatenate image URLs for each inventory item
    const updatedInventory = inventory.map(item => ({
      ...item,
      image: item.image // Assuming image is an array of URLs
    }));

    const productDataToSubmit = {
      ...data,
      inventory: updatedInventory, // Include only valid inventory items
    };

    await onSubmit(productDataToSubmit); // Call the onSubmit prop
    refetch(); // Call refetch to refresh the product list
    onClose(); // Close the form
  };

  // Handler to show inventory section and add first variation
  const handleAddFirstVariation = () => {
    setShowInventory(true);
    // Only append if there are no fields yet
    if (fields.length === 0) {
      append({ size: '', color: '', quantity: 0, image: '' });
    }
  };

  const handleClose = () => {
    reset(); // Clear the form state
    onClose(); // Call the onClose prop
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                  <Select
                    {...field}
                    fullWidth
                    error={!!fieldState.error}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select Type</MenuItem>
                    <MenuItem value="tops">Tops</MenuItem>
                    <MenuItem value="bottoms">Bottoms</MenuItem>
                    <MenuItem value="shoes">Shoes</MenuItem>
                    <MenuItem value="accessories">Accessories</MenuItem>
                  </Select>
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
              <MultiImageUploader
                  onImagesUploaded={(urls) => handleMainImageUploaded(urls)}
                  currentImageUrls={mainImage || undefined}
              />
            </Grid>
            
            {/* Only show inventory section if showInventory is true */}
            {showInventory ? (
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
                      <MultiImageUploader
                        onImagesUploaded={(urls) => handleImagesUploaded(index, urls)}
                        currentImageUrls={field.image}
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
            ) : (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddFirstVariation}
                    variant="outlined"
                    color="primary"
                  >
                    Add Variation
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {product ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};