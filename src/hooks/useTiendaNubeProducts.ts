import { useQuery } from "@tanstack/react-query";
import { useTiendaNubeApi, TiendaNubeProduct } from "@/api/tiendaNubeService";

export const useTiendaNubeProducts = () => {
  const { getProducts } = useTiendaNubeApi();
  return useQuery<TiendaNubeProduct[]>({
    queryKey: ["tienda-nube-products"],
    queryFn: getProducts,
  });
};
