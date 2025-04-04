
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().optional(),
  is_active: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

const MenuManagement = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: undefined,
      is_active: true,
    },
  });

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormValues) => {
      if (isEditing) {
        const { error } = await supabase
          .from("menu_items")
          .update({ 
            name: data.name,
            description: data.description,
            category: data.category,
            price: data.price,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", isEditing);
        
        if (error) throw error;
        return { ...data, id: isEditing };
      } else {
        const { data: newItem, error } = await supabase
          .from("menu_items")
          .insert({ 
            name: data.name,
            description: data.description,
            category: data.category,
            price: data.price,
            is_active: data.is_active,
          })
          .select("*")
          .single();
        
        if (error) throw error;
        return newItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      form.reset();
      setIsEditing(null);
      toast.success(isEditing ? "Elemento del menú actualizado" : "Elemento del menú añadido");
    },
    onError: (error) => {
      console.error("Error en operación del menú:", error);
      toast.error("Ha ocurrido un error");
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("Elemento del menú eliminado");
    },
    onError: (error) => {
      console.error("Error eliminando elemento del menú:", error);
      toast.error("No se pudo eliminar el elemento");
    },
  });

  const onSubmit = (data: MenuItemFormValues) => {
    createMenuItemMutation.mutate(data);
  };

  const handleEditItem = (item: MenuItem) => {
    setIsEditing(item.id);
    form.reset({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      price: item.price || undefined,
      is_active: item.is_active || true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión del Menú</CardTitle>
        <CardDescription>
          Agregue, edite o elimine opciones del menú
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {isEditing ? "Editar elemento del menú" : "Añadir nuevo elemento del menú"}
            </h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Menú Ejecutivo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción del menú"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <Input placeholder="principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12000" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-2">
                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(null);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={createMenuItemMutation.isPending}
                  >
                    {createMenuItemMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : isEditing ? "Actualizar" : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir menú
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Elementos del menú disponibles</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category || "-"}</TableCell>
                        <TableCell>
                          {item.price ? `$${item.price.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="h-8 w-8 p-0 mr-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMenuItemMutation.mutate(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={deleteMenuItemMutation.isPending}
                          >
                            {deleteMenuItemMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No hay elementos del menú disponibles</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuManagement;
