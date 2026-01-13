import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Calendar, Loader2 } from 'lucide-react';
import { useGymPlans, type GymPlan } from '@/hooks/gym/useGymPlans';
import { useGymSubscriptions } from '@/hooks/gym/useGymSubscriptions';
import { useGymPayments } from '@/hooks/gym/useGymPayments';
import { useToast } from '@/components/ui/use-toast';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  onSuccess?: () => void;
}

export function CreateSubscriptionDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
  onSuccess
}: CreateSubscriptionDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [createPayment, setCreatePayment] = useState(true);
  const { toast } = useToast();

  const { useListPlans } = useGymPlans();
  const { useCreateSubscription, useActivateSubscription } = useGymSubscriptions();
  const { useCreatePayment } = useGymPayments();

  const { data: plans, isLoading: plansLoading } = useListPlans({ is_active: true, is_visible: true });
  const createSubscription = useCreateSubscription();
  const activateSubscription = useActivateSubscription();
  const createPaymentMutation = useCreatePayment();

  const selectedPlan = plans?.find(p => p.plan_id === selectedPlanId);

  const today = new Date();
  const periodEnd = selectedPlan ? addDays(today, selectedPlan.duration_days) : today;

  const handleSubmit = async () => {
    if (!selectedPlanId || !selectedPlan) {
      toast({
        title: 'Error',
        description: 'Selecciona un plan',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 1. Create the subscription
      const subscription = await createSubscription.mutateAsync({
        member_id: memberId,
        plan_id: selectedPlanId,
        billing_anchor_day: today.getDate(),
        auto_renew: autoRenew,
        grace_period_days: 3,
      });

      // 2. Optionally create a payment record
      if (createPayment) {
        await createPaymentMutation.mutateAsync({
          member_id: memberId,
          payment_type: 'membership',
          amount: selectedPlan.final_price,
          status: 'pending',
          payment_method: 'cash',
          membership_plan_id: selectedPlanId,
          due_date: today.toISOString().split('T')[0],
          description: `Suscripcion - ${selectedPlan.name}`,
        });
      }

      // 3. Activate the subscription immediately (assuming payment will be collected)
      await activateSubscription.mutateAsync({
        subscriptionId: subscription.subscription_id,
        data: {
          period_start: today.toISOString(),
          period_end: periodEnd.toISOString(),
          next_billing_date: periodEnd.toISOString(),
        }
      });

      toast({
        title: 'Suscripcion creada',
        description: `Se creo la suscripcion de ${memberName} al plan ${selectedPlan.name}`,
      });

      setSelectedPlanId('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo crear la suscripcion',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createSubscription.isPending || activateSubscription.isPending || createPaymentMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Nueva Suscripcion
          </DialogTitle>
          <DialogDescription>
            Crear suscripcion para <strong>{memberName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan selection */}
          <div className="space-y-2">
            <Label>Plan de membresia</Label>
            <Select
              value={selectedPlanId}
              onValueChange={setSelectedPlanId}
              disabled={plansLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={plansLoading ? 'Cargando planes...' : 'Seleccionar plan'} />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.plan_id} value={plan.plan_id}>
                    <div className="flex justify-between items-center gap-4">
                      <span>{plan.name}</span>
                      <span className="text-muted-foreground text-sm">
                        ${plan.final_price.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plan details */}
          {selectedPlan && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Duracion</span>
                <span className="font-medium">{selectedPlan.duration_days} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precio</span>
                <span className="font-medium">${selectedPlan.final_price.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Periodo
                </span>
                <span className="text-sm">
                  {format(today, 'dd MMM', { locale: es })} - {format(periodEnd, 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-renew" className="font-normal">Renovacion automatica</Label>
                <p className="text-xs text-muted-foreground">
                  Crear pago automaticamente al vencer
                </p>
              </div>
              <Switch
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="create-payment" className="font-normal">Crear pago pendiente</Label>
                <p className="text-xs text-muted-foreground">
                  Registrar el pago inicial como pendiente
                </p>
              </div>
              <Switch
                id="create-payment"
                checked={createPayment}
                onCheckedChange={setCreatePayment}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedPlanId || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear suscripcion'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
