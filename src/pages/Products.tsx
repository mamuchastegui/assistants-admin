
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import ProductsTable from "@/components/products/ProductsTable";
import ProductModal from "@/components/products/ProductModal";
import { useProducts } from "@/hooks/useProducts";
import { Product, ProductCreate } from "@/api/productService";
import { PrivateRoute } from "@/components/PrivateRoute";

const Products = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  
  const {
    createProduct,
    updateProduct,
    isCreating,
    isUpdating
  } = useProducts();

  const handleAddClick = () => {
    setSelectedProduct(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleSubmit = (data: ProductCreate) => {
    if (selectedProduct) {
      // Update existing product
      updateProduct({ id: selectedProduct.id, product: data });
    } else {
      // Create new product
      createProduct(data);
    }
    setModalOpen(false);
  };

  return (
    <PrivateRoute>
      <DashboardLayout>
        <div className="container mx-auto py-6 space-y-8">
          <PageHeader
            title="Gestión de Productos"
            description="Administra el catálogo de productos disponibles"
          />
          
          <ProductsTable 
            onEdit={handleEditClick}
            onAdd={handleAddClick}
            initialFilters={{ limit: 10, offset: 0 }}
          />
          
          <ProductModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            product={selectedProduct}
            onSubmit={handleSubmit}
            isLoading={isCreating || isUpdating}
          />
        </div>
      </DashboardLayout>
    </PrivateRoute>
  );
};

export default Products;
