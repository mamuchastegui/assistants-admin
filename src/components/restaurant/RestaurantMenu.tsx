
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type MenuItem = {
  name: string;
  description: string | null;
  category: string | null;
};

type MenuCategory = {
  title: string;
  items: MenuItem[];
};

const MenuCategory = ({ category, index }: { category: MenuCategory; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2 }}
      className="mb-8"
    >
      <h3 className="text-xl font-semibold mb-4 text-foreground">{category.title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index * 0.1) + (idx * 0.05) + 0.3 }}
            className="flex flex-col h-full"
          >
            <Card className="h-full border border-border bg-card/70 hover:bg-card/90 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  {item.description || ""}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const RestaurantMenu: React.FC = () => {
  // Fetch menu items from Supabase
  const { data: menuItems, isLoading, error } = useQuery({
    queryKey: ["restaurant-menu-items"],
    queryFn: async () => {
      console.log("Fetching menu items...");
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true });
      
      if (error) {
        console.error("Error fetching menu items:", error);
        throw error;
      }
      
      console.log("Menu items fetched:", data);
      return data || [];
    },
  });

  // Process the menu items into categories
  const processedMenuData = React.useMemo(() => {
    if (!menuItems) return [];
    
    // Group menu items by category
    const categoryMap: Record<string, MenuItem[]> = {};
    
    menuItems.forEach((item: any) => {
      const category = item.category || "Sin categoría";
      
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      
      categoryMap[category].push({
        name: item.name,
        description: item.description,
        category: item.category,
      });
    });
    
    // Convert the map to an array of categories
    return Object.entries(categoryMap).map(([title, items]) => ({
      title,
      items,
    }));
  }, [menuItems]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Menú</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto px-4">
          Nuestro menú está diseñado para ofrecer una variedad de platos gourmet que se adaptan a todos los gustos, 
          desde opciones tradicionales hasta alternativas más creativas y saludables. 
          Disfrute de nuestra selección en un ambiente relajado y cómodo.
        </p>
      </motion.div>
      
      <Separator className="mb-8 bg-primary/20" />
      
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando menú...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error al cargar el menú. Por favor, inténtelo de nuevo más tarde.</p>
          </div>
        ) : processedMenuData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay elementos del menú disponibles.</p>
            <p className="text-muted-foreground mt-2">Agregue elementos del menú desde la sección de administración.</p>
          </div>
        ) : (
          processedMenuData.map((category, index) => (
            <MenuCategory key={category.title} category={category} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
