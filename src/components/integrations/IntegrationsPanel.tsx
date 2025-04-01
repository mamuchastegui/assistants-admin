
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Share2, 
  MessageSquare, 
  Calendar, 
  ShoppingCart, 
  LineChart, 
  CreditCard,
  Mail,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  connected?: boolean;
  popular?: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  title, 
  description, 
  icon, 
  connected = false,
  popular = false
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-2 rounded-md">
              {icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {popular && <Badge variant="outline" className="text-xs bg-amber-100 border-amber-300 text-amber-800">Popular</Badge>}
              </div>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {connected ? (
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 font-medium">Conectado</span>
              </div>
            ) : (
              <Button variant="outline" size="sm">Conectar</Button>
            )}
          </div>
        </div>
      </CardHeader>
      {connected && (
        <CardFooter className="pt-2 pb-3 bg-muted/30 flex justify-between">
          <span className="text-xs text-muted-foreground">Última sincronización: hoy, 14:25</span>
          <Switch id={`${title}-active`} defaultChecked />
        </CardFooter>
      )}
    </Card>
  );
};

const IntegrationsPanel: React.FC = () => {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="connected">Conectadas</TabsTrigger>
          <TabsTrigger value="databases">Bases de Datos</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
        <Input placeholder="Buscar integración..." className="max-w-xs" />
      </div>

      <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            title="Airtable"
            description="Sincroniza tus citas y clientes con Airtable automáticamente."
            icon={<Database className="h-5 w-5 text-primary" />}
            connected={true}
            popular={true}
          />
          
          <IntegrationCard
            title="WhatsApp Business API"
            description="Conecta con la API oficial de WhatsApp Business."
            icon={<MessageSquare className="h-5 w-5 text-primary" />}
            connected={true}
          />
          
          <IntegrationCard
            title="Google Calendar"
            description="Sincroniza tus citas con Google Calendar."
            icon={<Calendar className="h-5 w-5 text-primary" />}
            popular={true}
          />
          
          <IntegrationCard
            title="Mailchimp"
            description="Gestiona tus campañas de email marketing."
            icon={<Mail className="h-5 w-5 text-primary" />}
          />
          
          <IntegrationCard
            title="Stripe"
            description="Procesa pagos online de forma segura."
            icon={<CreditCard className="h-5 w-5 text-primary" />}
          />
          
          <IntegrationCard
            title="Google Analytics"
            description="Analiza el comportamiento de tus clientes."
            icon={<LineChart className="h-5 w-5 text-primary" />}
          />
          
          <IntegrationCard
            title="WooCommerce"
            description="Conecta con tu tienda WooCommerce."
            icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          />
          
          <IntegrationCard
            title="Zapier"
            description="Conecta con miles de otras aplicaciones."
            icon={<Share2 className="h-5 w-5 text-primary" />}
            popular={true}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="connected" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            title="Airtable"
            description="Sincroniza tus citas y clientes con Airtable automáticamente."
            icon={<Database className="h-5 w-5 text-primary" />}
            connected={true}
            popular={true}
          />
          
          <IntegrationCard
            title="WhatsApp Business API"
            description="Conecta con la API oficial de WhatsApp Business."
            icon={<MessageSquare className="h-5 w-5 text-primary" />}
            connected={true}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="databases" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            title="Airtable"
            description="Sincroniza tus citas y clientes con Airtable automáticamente."
            icon={<Database className="h-5 w-5 text-primary" />}
            connected={true}
            popular={true}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="payments" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            title="Stripe"
            description="Procesa pagos online de forma segura."
            icon={<CreditCard className="h-5 w-5 text-primary" />}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="marketing" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            title="Mailchimp"
            description="Gestiona tus campañas de email marketing."
            icon={<Mail className="h-5 w-5 text-primary" />}
          />
          
          <IntegrationCard
            title="Google Analytics"
            description="Analiza el comportamiento de tus clientes."
            icon={<LineChart className="h-5 w-5 text-primary" />}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default IntegrationsPanel;
