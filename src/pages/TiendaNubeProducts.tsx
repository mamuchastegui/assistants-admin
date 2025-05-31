import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import { useTiendaNubeProducts } from "@/hooks/useTiendaNubeProducts";

const TiendaNubeProducts: React.FC = () => {
  const { data: products, isLoading, isError } = useTiendaNubeProducts();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader
          title="Productos Tienda Nube"
          description="Listado de productos sincronizados desde Tienda Nube"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-destructive">Error al cargar productos.</p>
        ) : !products || products.length === 0 ? (
          <p className="text-muted-foreground">No hay productos para mostrar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ${product.price.toFixed(2)}
                  </p>
                  {product.promotional_price && (
                    <p className="text-sm text-primary">
                      Oferta ${product.promotional_price.toFixed(2)}
                    </p>
                  )}
                  <a
                    href={product.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline text-blue-500"
                  >
                    Ver en tienda
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TiendaNubeProducts;
