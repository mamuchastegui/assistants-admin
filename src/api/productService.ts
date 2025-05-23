
import { useAuthApi } from "@/hooks/useAuthApi";
import { apiClient } from "@/api/client";

const API_URL = import.meta.env.VITE_API_URL || "https://api.condamind.com";
const PRODUCTS_ENDPOINT = "/v1/products";

// Types for product data
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  style?: string;
  size?: string;
  color?: string;
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  category: string;
  style?: string;
  size?: string;
  color?: string;
  stock: number;
  image_url?: string;
}

export interface ProductsResponse {
  products: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  category?: string;
  style?: string;
  size?: string;
  color?: string;
  max_price?: number;
  min_price?: number;
  limit?: number;
  offset?: number;
  name?: string; // Add this field as it's used in the code
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Non-authenticated product service
export const productService = {
  // List products with optional filters
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    // Convert filters to query params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`${PRODUCTS_ENDPOINT}?${params.toString()}`);
    return response.data;
  },
  
  // Get a specific product by ID
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get(`${PRODUCTS_ENDPOINT}/${id}`);
    return response.data;
  },
};

// Hook for authenticated product operations
export const useProductApi = () => {
  const authApiClient = useAuthApi();
  
  return {
    // List products (authenticated)
    async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await authApiClient.authFetch(`${API_URL}${PRODUCTS_ENDPOINT}?${params.toString()}`);
      return response;
    },
    
    // Get a specific product (authenticated)
    async getProduct(id: string): Promise<Product> {
      const response = await authApiClient.authFetch(`${API_URL}${PRODUCTS_ENDPOINT}/${id}`);
      return response;
    },
    
    // Create a new product
    async createProduct(product: ProductCreate): Promise<Product> {
      const response = await authApiClient.authFetch(`${API_URL}${PRODUCTS_ENDPOINT}`, {
        method: 'POST',
        body: JSON.stringify(product)
      });
      return response;
    },
    
    // Update an existing product
    async updateProduct(id: string, productData: Partial<ProductCreate>): Promise<Product> {
      const response = await authApiClient.authFetch(`${API_URL}${PRODUCTS_ENDPOINT}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      return response;
    },
    
    // Delete a product
    async deleteProduct(id: string): Promise<{ deleted: boolean }> {
      const response = await authApiClient.authFetch(`${API_URL}${PRODUCTS_ENDPOINT}/${id}`, {
        method: 'DELETE'
      });
      return response;
    }
  };
};
