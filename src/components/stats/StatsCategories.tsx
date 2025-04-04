
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatsCategory {
  id: string;
  name: string;
  value: string;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

const statsCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  value: z.string().min(1, "El valor es requerido"),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_active: z.boolean().default(true),
});

type StatsCategoryFormValues = z.infer<typeof statsCategorySchema>;

const StatsCategories = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const form = useForm<StatsCategoryFormValues>({
    resolver: zodResolver(statsCategorySchema),
    defaultValues: {
      name: "",
      value: "",
      icon: "",
      color: "",
      is_active: true,
    },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["stats-categories"],
    queryFn: async () => {
      if (!supabase) {
        console.error("Supabase client not initialized");
        return [] as StatsCategory[];
      }

      const { data, error } = await supabase
        .from("stats_categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) {
        console.error("Error fetching stats categories:", error);
        throw error;
      }
      return data as StatsCategory[];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: StatsCategoryFormValues) => {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      if (isEditing) {
        const { error } = await supabase
          .from("stats_categories")
          .update({ 
            name: data.name,
            value: data.value,
            icon: data.icon,
            color: data.color,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", isEditing);
        
        if (error) throw error;
        return { ...data, id: isEditing };
      } else {
        const { data: newItem, error } = await supabase
          .from("stats_categories")
          .insert({ 
            name: data.name,
            value: data.value,
            icon: data.icon,
            color: data.color,
            is_active: data.is_active,
          })
          .select("*")
          .single();
        
        if (error) throw error;
        return newItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats-categories"] });
      form.reset();
      setIsEditing(null);
      toast.success(isEditing ? "Categoría estadística actualizada" : "Categoría estadística añadida");
    },
    onError: (error) => {
      console.error("Error en operación de categoría:", error);
      toast.error("Ha ocurrido un error");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const { error } = await supabase
        .from("stats_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats-categories"] });
      toast.success("Categoría estadística eliminada");
    },
    onError: (error) => {
      console.error("Error eliminando categoría:", error);
      toast.error("No se pudo eliminar la categoría");
    },
  });

  const onSubmit = (data: StatsCategoryFormValues) => {
    createCategoryMutation.mutate(data);
  };

  const handleEditCategory = (category: StatsCategory) => {
    setIsEditing(category.id);
    form.reset({
      name: category.name,
      value: category.value,
      icon: category.icon || "",
      color: category.color || "",
      is_active: category.is_active || true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Categorías Estadísticas</CardTitle>
        <CardDescription>
          Añade, edita o elimina categorías para las estadísticas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {isEditing ? "Editar categoría" : "Añadir nueva categoría"}
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
                        <Input placeholder="Sin Gluten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input placeholder="sin_gluten" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícono</FormLabel>
                      <FormControl>
                        <Input placeholder="allergens" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="#4CAF50" {...field} />
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
                    disabled={createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : isEditing ? "Actualizar" : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir categoría
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Categorías estadísticas disponibles</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.value}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="h-8 w-8 p-0 mr-1"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={deleteCategoryMutation.isPending}
                          >
                            {deleteCategoryMutation.isPending ? (
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
                <p className="text-muted-foreground">No hay categorías estadísticas disponibles</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCategories;
