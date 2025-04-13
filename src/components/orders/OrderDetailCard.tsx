
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface OrderDetailCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

const OrderDetailCard = ({ title, value, icon }: OrderDetailCardProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="flex items-center justify-center mb-2">
          {icon && <span className="mr-2 text-muted-foreground">{icon}</span>}
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        <h3 className="text-2xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  );
};

export default OrderDetailCard;
