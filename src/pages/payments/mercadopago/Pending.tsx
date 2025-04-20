
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pending = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-600">
            Pago pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Tu pago está siendo procesado.</p>
            {paymentId && <p className="text-sm mt-2">ID de pago: {paymentId}</p>}
            {status && <p className="text-sm">Estado: {status}</p>}
            <p className="text-sm mt-4">Te notificaremos cuando se confirme el pago.</p>
          </div>
          <div className="flex justify-center mt-6">
            <Button asChild>
              <Link to="/orders">
                Ver mis pedidos
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pending;
