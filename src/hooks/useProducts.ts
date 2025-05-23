
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  useProductApi, 
  Product, 
  ProductCreate, 
  ProductFilters 
} from '@/api/productService';

export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const productApi = useProductApi();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching products
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
  });

  // Query for fetching a single product
  const getProduct = (id: string) => {
    return useQuery({
      queryKey: ['product', id],
      queryFn: () => productApi.getProduct(id),
    });
  };

  // Mutation for creating a product
  const createProductMutation = useMutation({
    mutationFn: (newProduct: ProductCreate) => productApi.createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al crear el producto",
        description: error.message || "Ha ocurrido un error inesperado",
      });
    },
  });

  // Mutation for updating a product
  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<ProductCreate> }) =>
      productApi.updateProduct(id, product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al actualizar el producto",
        description: error.message || "Ha ocurrido un error inesperado",
      });
    },
  });

  // Mutation for deleting a product
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error al eliminar el producto",
        description: error.message || "Ha ocurrido un error inesperado",
      });
    },
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    // Data and loading states
    products: data?.products || [],
    totalCount: data?.total || 0,
    isLoading,
    isError,
    error,
    
    // Filter management
    filters,
    updateFilters,
    
    // CRUD operations
    getProduct,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    
    // Mutations states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    
    // Refetch data
    refetch,
  };
};
