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
import { Inventory } from '@/types/Inventory';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => void;
  product?: Product;
  refetch: () => void;
}

type InventoryColorGroup = {
  color: string;
  images: string;
  sizes: { size: string; quantity: number }[];
};

export const ProductForm = ({ open, onClose, onSubmit, product, refetch }: ProductFormProps) => {
  // Helper for grouping old inventory by color (for edit mode)
  function groupInventoryByColor(inventory: Inventory[]) {
    const colorMap: { [color: string]: InventoryColorGroup } = {};
    inventory.forEach(item => {
      if (!colorMap[item.color]) {
        colorMap[item.color] = {
          color: item.color,
          images: item.image,
          sizes: [],
        };
      }
      colorMap[item.color].sizes.push({ size: item.size, quantity: item.quantity });
    });
    return Object.values(colorMap);
  }

  const { control, handleSubmit, setValue, reset, getValues } = useForm<CreateProductInput & { inventory: InventoryColorGroup[] }>({
    defaultValues: {
      ...product,
      inventory: product?.inventory
        ? groupInventoryByColor(product.inventory)
        : [{ color: '', images: '', sizes: [{ size: '', quantity: 0 }] }],
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      reset({
        ...product,
        inventory: product?.inventory
          ? groupInventoryByColor(product.inventory)
          : [{ color: '', images: '', sizes: [{ size: '', quantity: 0 }] }],
      });
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
        inventory: [{ color: '', images: '', sizes: [{ size: '', quantity: 0 }] }]
      });
    }
  }, [product, reset]);

  const handleMainImageUploaded = (imageUrl: string) => {
    setMainImage(imageUrl);
    setValue(`image`, imageUrl);
    setProductData({ ...productData, image: imageUrl });
  };

  // Handler for images
  const handleImagesUploaded = (colorIndex: number, imageUrls: string) => {
    setValue(`inventory.${colorIndex}.images`, imageUrls);
  };

  // Updated handlers for sizes
  const handleAddSize = (colorIndex: number) => {
    const currentSizes = getValues(`inventory.${colorIndex}.sizes`) || [];
    const newSizes = [...currentSizes, { size: '', quantity: 0 }];
    setValue(`inventory.${colorIndex}.sizes`, newSizes);
    setRefreshTrigger(prev => prev + 1); // Force re-render
  };

  const handleRemoveSize = (colorIndex: number, sizeIndex: number) => {
    const currentSizes = getValues(`inventory.${colorIndex}.sizes`) || [];
    const newSizes = currentSizes.filter((_, i) => i !== sizeIndex);
    setValue(`inventory.${colorIndex}.sizes`, newSizes);
    setRefreshTrigger(prev => prev + 1); // Force re-render
  };

  // On submit, flatten inventory
  const handleFormSubmit = async (data: CreateProductInput & { inventory: InventoryColorGroup[] }) => {
    const flatInventory = data.inventory.flatMap((colorGroup: InventoryColorGroup) =>
      colorGroup.sizes
        .filter(s => s.size && s.quantity > 0)
        .map(s => ({
          color: colorGroup.color,
          size: s.size,
          quantity: s.quantity,
          image: colorGroup.images,
        }))
    );
    const productDataToSubmit = {
      ...data,
      inventory: flatInventory,
    };
    await onSubmit(productDataToSubmit);
    refetch();
    onClose();
  };

  // Handler to show inventory section and add first variation
  const handleAddFirstVariation = () => {
    setShowInventory(true);
    // Only append if there are no fields yet
    if (fields.length === 0) {
      append({ color: '', images: '', sizes: [{ size: '', quantity: 0 }] });
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
                  Inventory Variations (by Color)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {fields.map((field, colorIndex) => (
                  <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name={`inventory.${colorIndex}.color`}
                          control={control}
                          rules={{ required: 'Color is required' }}
                          render={({ field, fieldState }) => (
                            <TextField {...field} label="Color" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <MultiImageUploader
                          onImagesUploaded={(urls) => handleImagesUploaded(colorIndex, urls)}
                          currentImageUrls={field.images}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        {fields.length > 1 && (
                          <IconButton onClick={() => remove(colorIndex)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">Sizes & Quantities</Typography>
                      {getValues(`inventory.${colorIndex}.sizes`)?.map((_, sizeIndex) => (
                        <Grid container spacing={2} key={`${sizeIndex}-${refreshTrigger}`} alignItems="center">
                          <Grid item xs={5}>
                            <Controller
                              name={`inventory.${colorIndex}.sizes.${sizeIndex}.size`}
                              control={control}
                              rules={{ required: 'Size is required' }}
                              render={({ field, fieldState }) => (
                                <TextField {...field} label="Size" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                              )}
                            />
                          </Grid>
                          <Grid item xs={5}>
                            <Controller
                              name={`inventory.${colorIndex}.sizes.${sizeIndex}.quantity`}
                              control={control}
                              rules={{ required: 'Quantity is required', min: 0 }}
                              render={({ field, fieldState }) => (
                                <TextField {...field} type="number" label="Quantity" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                              )}
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <IconButton onClick={() => handleRemoveSize(colorIndex, sizeIndex)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddSize(colorIndex)}
                        sx={{ mt: 1 }}
                      >
                        Add Size
                      </Button>
                    </Box>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => append({ color: '', images: '', sizes: [{ size: '', quantity: 0 }] })}
                  sx={{ mt: 1 }}
                >
                  Add Color
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