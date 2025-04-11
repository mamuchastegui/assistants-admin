
import React, { useEffect, useState } from "react";
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
import { fetchPaymentMethods, PaymentMethod } from "@/services/paymentService";

interface MenuItem {
  id: string;
  name: string;
  price: number | null;
}

interface DinnerGroup {
  id: string;
  requester_name: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  notes?: string;
}

// Define the order schema with support for dinner groups
const orderSchema = z.object({
  client_name: z.string().min(1, "El nombre del cliente es requerido"),
  event_date: z.string().min(1, "La fecha del evento es requerida"),
  number_of_people: z.coerce.number().positive("Debe ser un número mayor a 0"),
  menu_type: z.string().min(1, "El tipo de menú es requerido"),
  special_requirements: z.string().optional(),
  payment_method: z.string().min(1, "El método de pago es requerido"),
  payment_status: z.string().default("pending"),
  requester_name: z.string().min(1, "El nombre del solicitante es requerido"),
  contact_email: z.string().email("Debe ser un correo válido").optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  company: z.string().optional(),
  dinner_group_notes: z.string().optional(),
  use_existing_group: z.boolean().default(false),
  dinner_group_id: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [paymentDetails, setPaymentDetails] = useState<Record<string, any>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showCashForm, setShowCashForm] = useState(false);
  const [existingGroups, setExistingGroups] = useState<DinnerGroup[]>([]);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_name: "",
      event_date: "",
      number_of_people: undefined,
      menu_type: "",
      special_requirements: "",
      payment_method: "",
      payment_status: "pending",
      requester_name: "",
      contact_email: "",
      contact_phone: "",
      company: "",
      dinner_group_notes: "",
      use_existing_group: false,
      dinner_group_id: undefined,
    },
  });

  // Fetch existing dinner groups
  const { data: dinnerGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ["dinner-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dinner_groups")
        .select("*")
        .order("requester_name", { ascending: true });
      
      if (error) throw error;
      return data as DinnerGroup[];
    },
  });

  useEffect(() => {
    if (dinnerGroups) {
      setExistingGroups(dinnerGroups);
    }
  }, [dinnerGroups]);

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

  // Consulta para obtener los métodos de pago
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setPaymentDetails({});
      setSelectedPaymentMethod(null);
      setShowCashForm(false);
    }
  }, [open, form]);

  // Update selected payment method when payment_method changes
  useEffect(() => {
    const paymentMethodValue = form.watch("payment_method");
    
    if (paymentMethodValue && paymentMethods) {
      const selected = paymentMethods.find(method => method.id === paymentMethodValue);
      setSelectedPaymentMethod(selected || null);
      
      // Show cash form when cash payment is selected
      if (selected?.type === 'cash') {
        setShowCashForm(true);
      } else {
        setShowCashForm(false);
      }
    } else {
      setSelectedPaymentMethod(null);
      setShowCashForm(false);
    }
  }, [form.watch("payment_method"), paymentMethods]);

  // Toggle dinner group selection fields based on use_existing_group value
  const useExistingGroup = form.watch("use_existing_group");

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      // Step 1: Create or get dinner group
      let dinnerGroupId: string | null = null;
      
      if (data.use_existing_group && data.dinner_group_id) {
        dinnerGroupId = data.dinner_group_id;
      } else {
        // Create a new dinner group
        const { data: newGroup, error: groupError } = await supabase
          .from("dinner_groups")
          .insert({
            requester_name: data.requester_name,
            contact_email: data.contact_email || null,
            contact_phone: data.contact_phone || null,
            company: data.company || null,
            notes: data.dinner_group_notes || null
          })
          .select("id")
          .single();

        if (groupError) throw groupError;
        dinnerGroupId = newGroup.id;
      }

      // Step 2: Create order
      const { data: newOrder, error: orderError } = await supabase
        .from("catering_orders")
        .insert({
          client_name: data.client_name,
          event_date: data.event_date,
          number_of_people: data.number_of_people,
          menu_type: data.menu_type,
          special_requirements: data.special_requirements || null,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          status: "pending",
          dinner_group_id: dinnerGroupId,
          payment_details: paymentDetails
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      
      // Step 3: Create payment record
      let paymentAmount = 0;
      
      // Calculate payment amount based on menu item price or default to 12000 per person
      if (menuItems && data.menu_type) {
        const selectedMenu = menuItems.find(item => item.name === data.menu_type);
        paymentAmount = (selectedMenu?.price || 12000) * data.number_of_people;
      } else {
        paymentAmount = 12000 * data.number_of_people;
      }
      
      const { error: paymentError } = await supabase
        .from("order_payments")
        .insert({
          order_id: newOrder.id,
          amount: paymentAmount,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          payment_details: paymentDetails,
          reference_number: paymentDetails.receipt_number || null
        });

      if (paymentError) throw paymentError;
      
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onOpenChange(false);
      form.reset();
      setPaymentDetails({});
      setSelectedPaymentMethod(null);
      setShowCashForm(false);
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

  const handlePaymentDetailChange = (key: string, value: string) => {
    setPaymentDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderPaymentDetailsFields = () => {
    if (!selectedPaymentMethod) return null;

    switch (selectedPaymentMethod.type) {
      case 'transfer':
        return (
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Número de cuenta destino</FormLabel>
              <FormControl>
                <Input 
                  readOnly 
                  value={selectedPaymentMethod.details.account_number || ""} 
                  className="bg-gray-50" 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Banco</FormLabel>
              <FormControl>
                <Input 
                  readOnly 
                  value={selectedPaymentMethod.details.bank || ""} 
                  className="bg-gray-50" 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Número de comprobante</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Número de comprobante de transferencia" 
                  onChange={(e) => handlePaymentDetailChange("receipt_number", e.target.value)} 
                />
              </FormControl>
            </FormItem>
          </div>
        );
      case 'alias':
        return (
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Alias</FormLabel>
              <FormControl>
                <Input 
                  readOnly 
                  value={selectedPaymentMethod.details.alias || ""} 
                  className="bg-gray-50" 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Número de comprobante</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Número de comprobante" 
                  onChange={(e) => handlePaymentDetailChange("receipt_number", e.target.value)} 
                />
              </FormControl>
            </FormItem>
          </div>
        );
      case 'cbu':
        return (
          <div className="space-y-4">
            <FormItem>
              <FormLabel>CBU</FormLabel>
              <FormControl>
                <Input 
                  readOnly 
                  value={selectedPaymentMethod.details.cbu || ""} 
                  className="bg-gray-50" 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Número de comprobante</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Número de comprobante" 
                  onChange={(e) => handlePaymentDetailChange("receipt_number", e.target.value)} 
                />
              </FormControl>
            </FormItem>
          </div>
        );
      case 'mercado_pago':
        return (
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Usuario de MercadoPago</FormLabel>
              <FormControl>
                <Input 
                  readOnly 
                  value={selectedPaymentMethod.details.username || ""} 
                  className="bg-gray-50" 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Referencia de pago</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Referencia o comprobante de pago" 
                  onChange={(e) => handlePaymentDetailChange("reference", e.target.value)} 
                />
              </FormControl>
            </FormItem>
          </div>
        );
      case 'cash':
        return (
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Monto en efectivo</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Ingrese monto" 
                  onChange={(e) => handlePaymentDetailChange("amount", e.target.value)} 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Notas adicionales" 
                  onChange={(e) => handlePaymentDetailChange("notes", e.target.value)} 
                />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Fecha prevista de pago</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  onChange={(e) => handlePaymentDetailChange("expected_payment_date", e.target.value)} 
                />
              </FormControl>
            </FormItem>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>
            Complete los detalles para crear un nuevo pedido de catering.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-md font-medium">Información del Grupo</h3>
              
              <FormField
                control={form.control}
                name="use_existing_group"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Usar un grupo existente
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              {useExistingGroup ? (
                <FormField
                  control={form.control}
                  name="dinner_group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo</FormLabel>
                      <FormControl>
                        {groupsLoading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Cargando grupos...</span>
                          </div>
                        ) : existingGroups && existingGroups.length > 0 ? (
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un grupo" />
                            </SelectTrigger>
                            <SelectContent>
                              {existingGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.requester_name} {group.company && `(${group.company})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-sm text-muted-foreground">No hay grupos disponibles</div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="requester_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Solicitante</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del solicitante" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de Contacto</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de teléfono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de la empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dinner_group_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas del Grupo (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Notas adicionales sobre el grupo"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div className="space-y-4 border-b pb-4">
              <h3 className="text-md font-medium">Información del Evento</h3>
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
                      ) : (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de menú" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Menú Estándar</SelectItem>
                            <SelectItem value="vegetarian">Menú Vegetariano</SelectItem>
                            <SelectItem value="vegan">Menú Vegano</SelectItem>
                            <SelectItem value="gluten_free">Menú Sin Gluten</SelectItem>
                            <SelectItem value="premium">Menú Premium</SelectItem>
                            <SelectItem value="custom">Menú Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">Información de Pago</h3>
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <FormControl>
                      {paymentMethodsLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Cargando métodos de pago...</span>
                        </div>
                      ) : paymentMethods && paymentMethods.length > 0 ? (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un método de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input placeholder="Método de pago" {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedPaymentMethod && (
                <div className="rounded-md border border-gray-200 p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Detalles del Pago</h4>
                  {renderPaymentDetailsFields()}
                </div>
              )}
            </div>
            
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
