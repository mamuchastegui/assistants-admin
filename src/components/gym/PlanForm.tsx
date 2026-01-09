import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { CreatePlanInput, UpdatePlanInput, GymPlan } from '@/hooks/gym/useGymPlans';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripcion es requerida'),
  plan_type: z.enum(['basic', 'standard', 'premium', 'vip', 'student', 'corporate', 'family']),
  duration: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom']),
  duration_days: z.coerce.number().min(1, 'La duracion debe ser al menos 1 dia'),
  price: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.coerce.number({ invalid_type_error: 'El precio es requerido' }).min(1, 'El precio debe ser mayor a 0')
  ),
  enrollment_fee: z.coerce.number().optional(),
  discount_percentage: z.coerce.number().min(0).max(100).optional(),
  max_freezes_allowed: z.coerce.number().min(0).default(0),
  max_freeze_days: z.coerce.number().min(0).default(0),
  guest_passes_per_month: z.coerce.number().min(0).default(0),
  classes_per_week_limit: z.coerce.number().optional(),
  access_hours_start: z.string().optional(),
  access_hours_end: z.string().optional(),
  weekend_access: z.boolean().default(true),
  auto_renew: z.boolean().default(false),
  renewal_discount_percentage: z.coerce.number().min(0).max(100).optional(),
  is_active: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  max_members: z.coerce.number().optional(),
  features: z.array(z.string()).default([]),
  class_access: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

interface PlanFormProps {
  plan?: GymPlan;
  onSubmit: (data: CreatePlanInput | UpdatePlanInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const durationOptions = [
  { value: 'daily', label: 'Diario', days: 1 },
  { value: 'weekly', label: 'Semanal', days: 7 },
  { value: 'monthly', label: 'Mensual', days: 30 },
  { value: 'quarterly', label: 'Trimestral (3 meses)', days: 90 },
  { value: 'semiannual', label: 'Semestral (6 meses)', days: 180 },
  { value: 'annual', label: 'Anual', days: 365 },
  { value: 'custom', label: 'Personalizado', days: 0 },
];

export function PlanForm({ plan, onSubmit, onCancel, isLoading }: PlanFormProps) {
  const [newFeature, setNewFeature] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newTag, setNewTag] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: plan ? {
      ...plan,
      enrollment_fee: plan.enrollment_fee || undefined,
      discount_percentage: plan.discount_percentage || undefined,
      classes_per_week_limit: plan.classes_per_week_limit || undefined,
      renewal_discount_percentage: plan.renewal_discount_percentage || undefined,
      max_members: plan.max_members || undefined,
    } : {
      name: '',
      description: '',
      plan_type: 'standard',
      duration: 'monthly',
      duration_days: 30,
      price: '' as unknown as number, // Empty to force user input
      max_freezes_allowed: 0,
      max_freeze_days: 0,
      guest_passes_per_month: 0,
      weekend_access: true,
      auto_renew: false,
      is_active: true,
      is_visible: true,
      features: [],
      class_access: [],
      tags: [],
    },
  });

  const watchDuration = form.watch('duration');

  // Auto-update duration_days when duration changes
  const handleDurationChange = (value: string) => {
    const option = durationOptions.find(opt => opt.value === value);
    if (option && option.days > 0) {
      form.setValue('duration_days', option.days);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const current = form.getValues('features');
      form.setValue('features', [...current, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const current = form.getValues('features');
    form.setValue('features', current.filter((_, i) => i !== index));
  };

  const handleAddClass = () => {
    if (newClass.trim()) {
      const current = form.getValues('class_access');
      form.setValue('class_access', [...current, newClass.trim()]);
      setNewClass('');
    }
  };

  const handleRemoveClass = (index: number) => {
    const current = form.getValues('class_access');
    form.setValue('class_access', current.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const current = form.getValues('tags');
      form.setValue('tags', [...current, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const current = form.getValues('tags');
    form.setValue('tags', current.filter((_, i) => i !== index));
  };

  const onInvalid = (errors: any) => {
    console.error('Form validation errors:', errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(`Error de validacion: ${firstError.message}`);
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Informacion Basica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informacion Basica</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Plan</FormLabel>
                <FormControl>
                  <Input placeholder="Plan Mensual Premium" {...field} />
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
                <FormLabel>Descripcion</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe que incluye este plan..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="plan_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basico</SelectItem>
                      <SelectItem value="standard">Estandar</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="corporate">Corporativo</SelectItem>
                      <SelectItem value="family">Familiar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duracion</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleDurationChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar duracion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchDuration === 'custom' && (
            <FormField
              control={form.control}
              name="duration_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duracion Personalizada (dias)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Precios */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Precios</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (ARS)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollment_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuota de Inscripcion (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento % (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="renewal_discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento Renovacion % (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Aplicado en renovacion automatica
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Caracteristicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Caracteristicas y Acceso</h3>

          <div className="space-y-2">
            <FormLabel>Caracteristicas del Plan</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar caracteristica..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button type="button" onClick={handleAddFeature}>Agregar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('features').map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {feature}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveFeature(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel>Acceso a Clases</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar tipo de clase..."
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClass();
                  }
                }}
              />
              <Button type="button" onClick={handleAddClass}>Agregar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('class_access').map((cls, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {cls}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveClass(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="classes_per_week_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite de Clases por Semana</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Ilimitado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guest_passes_per_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pases de Invitado por Mes</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="access_hours_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario de Acceso Desde</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access_hours_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario de Acceso Hasta</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Reglas de Membresia */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reglas de Membresia</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="max_freezes_allowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Congelamientos Permitidos</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Cantidad de veces que se puede congelar la membresia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_freeze_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de Congelamiento</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Total de dias que se puede congelar la membresia
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="max_members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximo de Miembros (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="Ilimitado" {...field} />
                </FormControl>
                <FormDescription>
                  Cantidad maxima de miembros permitidos en este plan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Configuracion */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuracion</h3>

          <FormField
            control={form.control}
            name="weekend_access"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Acceso Fin de Semana</FormLabel>
                  <FormDescription>
                    Los miembros pueden acceder al gimnasio los fines de semana
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auto_renew"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Renovacion Automatica</FormLabel>
                  <FormDescription>
                    Renovar automaticamente la membresia al final del periodo
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activo</FormLabel>
                  <FormDescription>
                    El plan esta actualmente activo
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_visible"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Visible</FormLabel>
                  <FormDescription>
                    Mostrar plan a nuevos miembros durante el registro
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Etiquetas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Etiquetas</h3>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Agregar etiqueta..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag}>Agregar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('tags').map((tag, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : plan ? 'Actualizar Plan' : 'Crear Plan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}