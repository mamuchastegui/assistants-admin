
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  name: string;
  price: number | null;
}

const orderSchema = z.object({
  client_name: z.string().min(1, "El nombre del cliente es requerido"),
  event_date: z.string().min(1, "La fecha del evento es requerida"),
  number_of_people: z.coerce.number().positive("Debe ser un número mayor a 0"),
  menu_type: z.string().min(1, "El tipo de menú es requerido"),
  special_requirements: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_name: "",
      event_date: "",
      number_of_people: undefined,
      menu_type: "",
      special_requirements: "",
    },
  });

  // Consulta para obtener los tipos de menú
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery({
    queryKey: ["menu-items-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, price")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const response = await fetch("https://api.condamind.com/v1/catering/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: data.client_name,
          event_date: data.event_date,
          number_of_people: data.number_of_people,
          menu_type: data.menu_type,
          special_requirements: data.special_requirements || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el pedido");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onOpenChange(false);
      form.reset();
      toast.success("Pedido creado exitosamente");
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast.error("No se pudo crear el pedido");
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>
            Complete los detalles para crear un nuevo pedido de catering.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Evento</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="number_of_people"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Personas</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="Cantidad de personas" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="menu_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Menú</FormLabel>
                  <FormControl>
                    {menuItemsLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Cargando menús...</span>
                      </div>
                    ) : menuItems && menuItems.length > 0 ? (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de menú" />
                        </SelectTrigger>
                        <SelectContent>
                          {menuItems.map((item) => (
                            <SelectItem key={item.id} value={item.name}>
                              {item.name} {item.price && `($${item.price.toLocaleString()})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder="Tipo de menú" {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="special_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requerimientos Especiales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Alergias, restricciones dietéticas, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createOrderMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Creando..." : "Crear Pedido"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderModal;
