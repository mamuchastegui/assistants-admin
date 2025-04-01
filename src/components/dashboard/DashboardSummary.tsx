
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp 
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="bg-primary/10 p-2 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.positive && 'transform rotate-180'}`} />
            <span>{trend.value} vs. mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardSummary: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Turnos Agendados"
        value="24"
        description="Esta semana"
        icon={<Calendar className="h-4 w-4 text-primary" />}
        trend={{
          value: "+12%",
          positive: true
        }}
      />
      <StatCard
        title="Clientes Nuevos"
        value="8"
        description="Últimos 30 días"
        icon={<Users className="h-4 w-4 text-primary" />}
        trend={{
          value: "+5%",
          positive: true
        }}
      />
      <StatCard
        title="Mensajes Recibidos"
        value="143"
        description="Últimos 7 días"
        icon={<MessageSquare className="h-4 w-4 text-primary" />}
        trend={{
          value: "+28%",
          positive: true
        }}
      />
      <StatCard
        title="Tasa de Conversión"
        value="68%"
        description="Mensajes a turnos"
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        trend={{
          value: "+4%",
          positive: true
        }}
      />
    </div>
  );
};

export default DashboardSummary;
