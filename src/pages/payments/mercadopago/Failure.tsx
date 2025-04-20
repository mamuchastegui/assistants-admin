
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Failure = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Error en el pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>Lo sentimos, ha ocurrido un error al procesar tu pago.</p>
            {paymentId && <p className="text-sm mt-2">ID de pago: {paymentId}</p>}
            {status && <p className="text-sm">Estado: {status}</p>}
          </div>
          <div className="flex justify-center mt-6">
            <Button asChild variant="default">
              <Link to="/orders">
                Volver a intentar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Failure;
