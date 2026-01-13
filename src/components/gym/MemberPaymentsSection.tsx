import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useGymPayments, type GymPayment } from '@/hooks/gym/useGymPayments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MemberPaymentsSectionProps {
  memberId: string;
  onCreatePayment?: () => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', variant: 'outline', icon: Clock },
  processing: { label: 'Procesando', variant: 'secondary', icon: Clock },
  completed: { label: 'Pagado', variant: 'default', icon: CheckCircle },
  failed: { label: 'Fallido', variant: 'destructive', icon: XCircle },
  cancelled: { label: 'Cancelado', variant: 'outline', icon: XCircle },
  refunded: { label: 'Reembolsado', variant: 'secondary', icon: AlertCircle },
  partially_refunded: { label: 'Reembolso parcial', variant: 'secondary', icon: AlertCircle },
};

const paymentTypeLabels: Record<string, string> = {
  membership: 'Membresia',
  enrollment: 'Inscripcion',
  renewal: 'Renovacion',
  class: 'Clase',
  personal_training: 'Entrenamiento personal',
  product: 'Producto',
  penalty: 'Multa',
  other: 'Otro',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
  } catch {
    return '-';
  }
}

export function MemberPaymentsSection({ memberId, onCreatePayment }: MemberPaymentsSectionProps) {
  const { useMemberPayments } = useGymPayments();
  const { data: payments, isLoading, error } = useMemberPayments(memberId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagos
          </h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagos
          </h3>
        </div>
        <div className="text-sm text-muted-foreground text-center py-4">
          Error al cargar los pagos
        </div>
      </div>
    );
  }

  const paymentsList = payments || [];

  // Calculate totals
  const totalPaid = paymentsList
    .filter((p: GymPayment) => p.status === 'completed')
    .reduce((sum: number, p: GymPayment) => sum + p.amount, 0);

  const totalPending = paymentsList
    .filter((p: GymPayment) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum: number, p: GymPayment) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagos
        </h3>
        {onCreatePayment && (
          <Button size="sm" variant="outline" onClick={onCreatePayment}>
            Nuevo pago
          </Button>
        )}
      </div>

      {/* Summary */}
      {paymentsList.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-600 text-xs">Total pagado</p>
            <p className="text-green-700 font-semibold">${totalPaid.toLocaleString('es-AR')}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-yellow-600 text-xs">Pendiente</p>
            <p className="text-yellow-700 font-semibold">${totalPending.toLocaleString('es-AR')}</p>
          </div>
        </div>
      )}

      {/* Payments list */}
      {paymentsList.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No hay pagos registrados</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {paymentsList.map((payment: GymPayment) => {
            const config = statusConfig[payment.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={payment.payment_id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {paymentTypeLabels[payment.payment_type] || payment.payment_type}
                    </span>
                    <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(payment.payment_date || payment.created_at)}</span>
                    {payment.is_overdue && (
                      <Badge variant="destructive" className="text-xs px-1">
                        Vencido
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${payment.amount.toLocaleString('es-AR')}</p>
                  {payment.payment_link && (
                    <a
                      href={payment.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
