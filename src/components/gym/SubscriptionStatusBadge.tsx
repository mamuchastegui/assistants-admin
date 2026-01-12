import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  XCircle,
  Ban
} from 'lucide-react';
import type { SubscriptionStatus } from '@/hooks/gym/useGymSubscriptions';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const statusConfig: Record<SubscriptionStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  icon: React.ElementType;
}> = {
  pending_payment: {
    label: 'Pendiente de pago',
    variant: 'outline',
    className: 'border-yellow-500 text-yellow-600 bg-yellow-50',
    icon: Clock,
  },
  active: {
    label: 'Activa',
    variant: 'default',
    className: 'bg-green-500 hover:bg-green-600',
    icon: CheckCircle,
  },
  past_due: {
    label: 'En mora',
    variant: 'destructive',
    className: 'bg-red-500 hover:bg-red-600',
    icon: AlertTriangle,
  },
  suspended: {
    label: 'Pausada',
    variant: 'secondary',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    icon: Pause,
  },
  cancelled: {
    label: 'Cancelada',
    variant: 'outline',
    className: 'border-gray-400 text-gray-600',
    icon: Ban,
  },
  expired: {
    label: 'Vencida',
    variant: 'outline',
    className: 'border-gray-400 text-gray-500 bg-gray-50',
    icon: XCircle,
  },
};

export function SubscriptionStatusBadge({
  status,
  showIcon = true,
  size = 'default'
}: SubscriptionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />}
      {config.label}
    </Badge>
  );
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  return statusConfig[status]?.label || status;
}

export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
  const colorMap: Record<SubscriptionStatus, string> = {
    pending_payment: 'yellow',
    active: 'green',
    past_due: 'red',
    suspended: 'blue',
    cancelled: 'gray',
    expired: 'gray',
  };
  return colorMap[status] || 'gray';
}
