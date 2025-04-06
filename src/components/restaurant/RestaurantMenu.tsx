
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

type MenuItem = {
  name: string;
  description: string;
};

type MenuCategory = {
  title: string;
  items: MenuItem[];
};

const menuData: MenuCategory[] = [
  {
    title: "Entradas",
    items: [
      {
        name: "Carpaccio de Res",
        description: "Finas láminas de res con aceite de oliva, alcaparras, cebolla morada y limón."
      },
      {
        name: "Sopa de Calabaza y Zanahoria",
        description: "Crema suave de calabaza con jengibre y toque de crema fresca."
      },
      {
        name: "Empanadas Criollas",
        description: "Clásicas empanadas de carne cortada a cuchillo, cebolla, huevo y aceitunas."
      },
      {
        name: "Picada Argentina",
        description: "Quesos, fiambres, aceitunas y pan casero."
      }
    ]
  },
  {
    title: "Carnes",
    items: [
      {
        name: "Bife de Chorizo",
        description: "Bife de chorizo al grill con salsa de vino tinto acompañado con papas al romero y ajo."
      },
      {
        name: "Pechuga Rellena",
        description: "Pechuga rellena de jamón y queso con ensalada de brócoli, zanahoria y arroz yamani."
      },
      {
        name: "Bondiola Braseada",
        description: "Bondiola braseada."
      },
      {
        name: "Milanesa Napolitana",
        description: "Milanesa napolitana acompañada de verduras horneadas con puré de papas cremoso."
      }
    ]
  },
  {
    title: "Platos Alternativos",
    items: [
      {
        name: "Lasagna Clásica",
        description: "Lasagna con capas de pasta rellena con ternera desmenuzada, mozzarella y salsa de tomate."
      },
      {
        name: "Humita en Chala",
        description: "Cocida al vapor."
      }
    ]
  },
  {
    title: "Vegetarianos",
    items: [
      {
        name: "Lasagna Vegetariana",
        description: "Lasagna con capas de berenjenas, calabacines, tomate y mozzarella."
      },
      {
        name: "Tartar de Quinoa y Aguacate",
        description: "Ensalada fresca de quinoa con aguacate, pepino, tomate, cebolla morada y aliño de limón."
      }
    ]
  },
  {
    title: "Pescado",
    items: [
      {
        name: "Trucha al Horno",
        description: "Trucha horneada con manteca, ajo y romero acompañada de puré de apio y papas."
      },
      {
        name: "Pejerrey Frito",
        description: "Filete de pejerrey apanado y frito acompañado de papas fritas crujientes y salsa picante."
      }
    ]
  }
];

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
                  {item.description}
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
        {menuData.map((category, index) => (
          <MenuCategory key={index} category={category} index={index} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
