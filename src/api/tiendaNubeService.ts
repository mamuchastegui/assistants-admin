import { useAuthApi } from "@/api/client";

export interface TiendaNubeVariant {
  id: number;
  sku: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  visible: boolean;
  image_url: string | null;
  options: Record<string, string>;
}

export interface TiendaNubeProduct {
  id: number;
  name: string;
  price: number;
  promotional_price: number | null;
  sku: string | null;
  stock: number;
  permalink: string;
  image_url: string | null;
  category_ids: number[];
  tags: string[];
  variants: TiendaNubeVariant[];
}

const ENDPOINT = "/tiendanube/products";

export const useTiendaNubeApi = () => {
  const authApiClient = useAuthApi();

  const getProducts = async (): Promise<TiendaNubeProduct[]> => {
    const response = await authApiClient.get<TiendaNubeProduct[]>(ENDPOINT, {
      headers: {
        "User-Agent": "CONDAMIND (matias@condamind.com)",
      },
    });
    return response.data;
  };

  return { getProducts };
};
