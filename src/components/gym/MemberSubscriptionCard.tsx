import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import {
  Calendar,
  CreditCard,
  RefreshCw,
  Pause,
  Play,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { GymSubscription, GymSubscriptionDetail } from '@/hooks/gym/useGymSubscriptions';

interface MemberSubscriptionCardProps {
  subscription: GymSubscription | GymSubscriptionDetail | null;
  onActivate?: () => void;
  onSuspend?: () => void;
  onCancel?: () => void;
  onRenew?: () => void;
  isLoading?: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function MemberSubscriptionCard({
  subscription,
  onActivate,
  onSuspend,
  onCancel,
  onRenew,
  isLoading
}: MemberSubscriptionCardProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Suscripcion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Este miembro no tiene una suscripcion activa
            </p>
            {onRenew && (
              <Button onClick={onRenew} className="mt-4" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Crear suscripcion
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isDetailSubscription = 'plan_name' in subscription;
  const planName = isDetailSubscription ? (subscription as GymSubscriptionDetail).plan_name : undefined;
  const planPrice = isDetailSubscription ? (subscription as GymSubscriptionDetail).plan_price : undefined;

  const canSuspend = subscription.status === 'active';
  const canCancel = ['active', 'past_due', 'pending_payment'].includes(subscription.status);
  const canActivate = ['pending_payment', 'expired'].includes(subscription.status);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Suscripcion
          </CardTitle>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan info */}
        {planName && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="font-medium">{planName}</span>
          </div>
        )}

        {planPrice !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Precio</span>
            <span className="font-medium">${planPrice.toLocaleString('es-AR')}</span>
          </div>
        )}

        {/* Period info */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Periodo actual:</span>
          </div>
          <div className="ml-6 text-sm">
            {subscription.current_period_start && subscription.current_period_end ? (
              <span>
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </span>
            ) : (
              <span className="text-muted-foreground">Sin periodo activo</span>
            )}
          </div>

          {subscription.days_until_period_end !== null && subscription.days_until_period_end !== undefined && (
            <div className="ml-6">
              {subscription.days_until_period_end > 7 ? (
                <span className="text-sm text-green-600">
                  {subscription.days_until_period_end} dias restantes
                </span>
              ) : subscription.days_until_period_end > 0 ? (
                <span className="text-sm text-yellow-600">
                  {subscription.days_until_period_end} dias restantes
                </span>
              ) : (
                <span className="text-sm text-red-600">
                  Vence hoy
                </span>
              )}
            </div>
          )}
        </div>

        {/* Next billing */}
        {subscription.next_billing_date && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Proximo cobro</span>
            <span>{formatDate(subscription.next_billing_date)}</span>
          </div>
        )}

        {/* Auto-renew */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Renovacion automatica</span>
          <span className={subscription.auto_renew ? 'text-green-600' : 'text-muted-foreground'}>
            {subscription.auto_renew ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        {/* Past due warning */}
        {subscription.status === 'past_due' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Pago vencido</span>
            </div>
            <p className="mt-1 ml-6">
              El acceso al gimnasio esta bloqueado hasta regularizar el pago.
            </p>
          </div>
        )}

        {/* Suspension info */}
        {subscription.status === 'suspended' && subscription.suspended_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              <span className="font-medium">Suscripcion pausada</span>
            </div>
            {subscription.suspension_reason && (
              <p className="mt-1 ml-6">Motivo: {subscription.suspension_reason}</p>
            )}
            {subscription.resume_date && (
              <p className="mt-1 ml-6">Reanuda: {formatDate(subscription.resume_date)}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-4 flex flex-wrap gap-2">
          {canActivate && onActivate && (
            <Button
              size="sm"
              onClick={onActivate}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-1" />
              Activar
            </Button>
          )}

          {canSuspend && onSuspend && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onSuspend}
              disabled={isLoading}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pausar
            </Button>
          )}

          {subscription.status === 'suspended' && onActivate && (
            <Button
              size="sm"
              onClick={onActivate}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-1" />
              Reanudar
            </Button>
          )}

          {onRenew && (subscription.status === 'active' || subscription.status === 'expired') && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRenew}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Renovar
            </Button>
          )}

          {canCancel && onCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onCancel}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
