import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/api';
import {CreateProductInput } from '../types/product';
import { useState } from 'react';
import { Status } from '@/types/Status';

export const useProducts = (initialPage = 0, pageSize = 12) => {
  const [page, setPage] = useState(initialPage);
  const [type, setType] = useState<string>('');
  const queryClient = useQueryClient();


  

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', page, pageSize, type],
    queryFn: () => type 
      ? productService.getProductsByType(type, page, pageSize)
      : productService.getAllProducts(page, pageSize),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productService.createProduct(data),
    onSuccess: (response: Status) => {
      if (response.status === 'success') {
        queryClient.invalidateQueries({queryKey : ['products', page, type]} );
      } else {
        alert(response.message || 'Failed to create product');
      }
    },
    onError: (error) => {
      alert('Failed to create product. Please try again later.');
      console.error('Create product error:', error);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: (params: { id: number; data: CreateProductInput }) => 
      productService.updateProduct(params.id, params.data),
    onError: (error) => {
      // Show error message without logging out
      alert('Failed to update product. Please try again later.');
      console.error('Update product error:', error);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey : ['products', page, type]});
    },
  });

  return {
    products: data?.content || [],
    totalPages: data?.totalPages || 0,
    page,
    setPage,
    type,
    setType,
    isLoading,
    error,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    refetch,
  };
}; 