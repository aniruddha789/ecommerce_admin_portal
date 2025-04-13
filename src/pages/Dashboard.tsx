import { Typography, Grid, Paper, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/api';
import { MultiImageUploader } from '@/components/MultiImageUploader';

export const Dashboard = () => {
  const { data: productData, isLoading } = useQuery({
    queryKey: ['products-count'],
    queryFn: () => productService.getAllProducts(0, 1), // Get first page to get total count
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Products
            </Typography>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h3">
                {productData?.totalPages || 0}
              </Typography>
            )}
          </Paper>
          <MultiImageUploader onImagesUploaded={(urls : string) => { console.log(urls)}}></MultiImageUploader>
        </Grid>
      </Grid>
    </Box>
  );
}; 