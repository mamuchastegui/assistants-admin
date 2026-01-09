import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, DollarSign, Percent, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGymPlans, GymPlan, CreatePlanInput } from '@/hooks/gym/useGymPlans';
import { PlanForm } from '@/components/gym/PlanForm';

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState<GymPlan | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [filterVisible, setFilterVisible] = useState<boolean | undefined>(undefined);

  const {
    useListPlans,
    useCreatePlan,
    useDeletePlan,
    useUpdatePrice,
    useUpdateDiscount,
    useToggleVisibility,
  } = useGymPlans();

  const { data: plans, isLoading } = useListPlans({ is_visible: filterVisible });
  const createPlan = useCreatePlan();
  const deletePlan = useDeletePlan();
  const updatePrice = useUpdatePrice();
  const updateDiscount = useUpdateDiscount();
  const toggleVisibility = useToggleVisibility();

  const handleDeletePlan = () => {
    if (selectedPlan) {
      deletePlan.mutate(selectedPlan.plan_id);
      setShowDeleteDialog(false);
      setSelectedPlan(null);
    }
  };

  const handleUpdatePrice = () => {
    if (selectedPlan && newPrice) {
      updatePrice.mutate({
        planId: selectedPlan.plan_id,
        price: parseFloat(newPrice),
      });
      setShowPriceDialog(false);
      setNewPrice('');
      setSelectedPlan(null);
    }
  };

  const handleUpdateDiscount = () => {
    if (selectedPlan) {
      updateDiscount.mutate({
        planId: selectedPlan.plan_id,
        discount_percentage: newDiscount ? parseFloat(newDiscount) : undefined,
      });
      setShowDiscountDialog(false);
      setNewDiscount('');
      setSelectedPlan(null);
    }
  };

  const handleToggleVisibility = (plan: GymPlan) => {
    toggleVisibility.mutate(plan.plan_id);
  };

  const handleCreatePlan = (data: CreatePlanInput) => {
    createPlan.mutate(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  const getDurationLabel = (duration: string, days: number) => {
    const labels: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      quarterly: '3 Meses',
      semiannual: '6 Meses',
      annual: 'Anual',
      custom: `${days} dias`,
    };
    return labels[duration] || duration;
  };

  const getPlanTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      vip: 'bg-yellow-100 text-yellow-800',
      student: 'bg-green-100 text-green-800',
      corporate: 'bg-indigo-100 text-indigo-800',
      family: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Planes de Membresia</h1>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filterVisible === undefined ? 'default' : 'outline'}
          onClick={() => setFilterVisible(undefined)}
          size="sm"
        >
          Todos
        </Button>
        <Button
          variant={filterVisible === true ? 'default' : 'outline'}
          onClick={() => setFilterVisible(true)}
          size="sm"
        >
          Solo Visibles
        </Button>
        <Button
          variant={filterVisible === false ? 'default' : 'outline'}
          onClick={() => setFilterVisible(false)}
          size="sm"
        >
          Solo Ocultos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista General de Planes</CardTitle>
          <CardDescription>
            Gestiona los planes de membresia y precios de tu gimnasio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Duracion</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Precio Final</TableHead>
                  <TableHead>Miembros</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans?.map((plan) => (
                  <TableRow key={plan.plan_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {plan.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanTypeColor(plan.plan_type)}>
                        {plan.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getDurationLabel(plan.duration, plan.duration_days)}
                    </TableCell>
                    <TableCell>{formatPrice(plan.price)}</TableCell>
                    <TableCell>
                      {plan.discount_percentage ? (
                        <Badge variant="secondary">
                          {plan.discount_percentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(plan.final_price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {plan.member_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {plan.is_active ? (
                          <Badge variant="default">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                        {plan.is_visible ? (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Visible
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Oculto
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Editar Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setNewPrice(plan.price.toString());
                              setShowPriceDialog(true);
                            }}
                          >
                            <DollarSign className="h-4 w-4" />
                            Actualizar Precio
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setNewDiscount(plan.discount_percentage?.toString() || '');
                              setShowDiscountDialog(true);
                            }}
                          >
                            <Percent className="h-4 w-4" />
                            Aplicar Descuento
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleToggleVisibility(plan)}
                          >
                            {plan.is_visible ? (
                              <>
                                <EyeOff className="h-4 w-4" />
                                Ocultar Plan
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Mostrar Plan
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-red-600"
                            disabled={plan.member_count && plan.member_count > 0}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Eliminar Plan */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Plan</DialogTitle>
            <DialogDescription>
              ¿Estas seguro que deseas eliminar "{selectedPlan?.name}"? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Eliminar Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Actualizar Precio */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Precio</DialogTitle>
            <DialogDescription>
              Establecer un nuevo precio para "{selectedPlan?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Nuevo Precio (ARS)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {selectedPlan && (
              <div className="text-sm text-muted-foreground">
                Precio actual: {formatPrice(selectedPlan.price)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePrice}>
              Actualizar Precio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Descuento */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar Descuento</DialogTitle>
            <DialogDescription>
              Aplicar un porcentaje de descuento a "{selectedPlan?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Porcentaje de Descuento (%)</Label>
              <Input
                id="discount"
                type="number"
                step="1"
                min="0"
                max="100"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="Dejar vacio para quitar descuento"
              />
            </div>
            {selectedPlan && selectedPlan.discount_percentage && (
              <div className="text-sm text-muted-foreground">
                Descuento actual: {selectedPlan.discount_percentage}%
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateDiscount}>
              {newDiscount ? 'Aplicar Descuento' : 'Quitar Descuento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Crear Plan */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plan</DialogTitle>
            <DialogDescription>
              Define un nuevo plan de membresia para tu gimnasio
            </DialogDescription>
          </DialogHeader>
          <PlanForm
            onSubmit={handleCreatePlan}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createPlan.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}