import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SubscriptionStatus } from '@/hooks/gym/useGymSubscriptions';

interface TrainingStatusBadgeProps {
  canTrain: boolean;
  reason?: string;
  subscriptionStatus?: SubscriptionStatus | null;
  isLoading?: boolean;
}

const statusMessages: Record<string, string> = {
  active: 'Suscripcion activa',
  pending_payment: 'Pendiente de pago',
  past_due: 'Pago vencido',
  suspended: 'Suscripcion pausada',
  cancelled: 'Suscripcion cancelada',
  expired: 'Suscripcion vencida',
  no_subscription: 'Sin suscripcion',
};

export function TrainingStatusBadge({
  canTrain,
  reason,
  subscriptionStatus,
  isLoading
}: TrainingStatusBadgeProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        ...
      </Badge>
    );
  }

  const getStatusDisplay = () => {
    if (canTrain) {
      return {
        icon: CheckCircle2,
        label: 'Puede entrenar',
        className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100',
        iconClassName: 'text-green-600'
      };
    }

    // Not allowed to train - show reason
    if (subscriptionStatus === 'past_due') {
      return {
        icon: AlertTriangle,
        label: 'En mora',
        className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-100',
        iconClassName: 'text-red-600'
      };
    }

    if (subscriptionStatus === 'pending_payment') {
      return {
        icon: Clock,
        label: 'Pendiente pago',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100',
        iconClassName: 'text-yellow-600'
      };
    }

    if (subscriptionStatus === 'suspended') {
      return {
        icon: AlertTriangle,
        label: 'Pausado',
        className: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100',
        iconClassName: 'text-blue-600'
      };
    }

    // Default - cannot train
    return {
      icon: XCircle,
      label: 'No puede entrenar',
      className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100',
      iconClassName: 'text-gray-500'
    };
  };

  const status = getStatusDisplay();
  const Icon = status.icon;
  const tooltip = reason || statusMessages[subscriptionStatus || 'no_subscription'] || 'Sin acceso';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`flex items-center gap-1 cursor-help ${status.className}`}>
            <Icon className={`h-3 w-3 ${status.iconClassName}`} />
            {status.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
