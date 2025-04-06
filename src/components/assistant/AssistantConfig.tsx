
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Save, Plus, Trash2, Loader2 } from "lucide-react";
import ChatInterface from "@/components/whatsapp/ChatInterface";

// Define interfaces without dependency of the hook
interface QuickResponse {
  id: number;
  trigger: string;
  response: string;
}

interface AssistantConfig {
  id: string;
  name: string;
  isActive: boolean;
  businessDescription: string;
  welcomeMessage: string;
  awayMessage: string;
  bookingConfirmation: string;
  reminderMessage: string;
  followupMessage: string;
  notifyOwner: boolean;
  allowHumanIntervention: boolean;
  quickResponses: QuickResponse[];
}

const AssistantConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 bg-muted/30 backdrop-blur-sm">
        <TabsTrigger value="general" className="data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">General</TabsTrigger>
        <TabsTrigger value="messages" className="data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Mensajes Automáticos</TabsTrigger>
        <TabsTrigger value="quick" className="data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">Respuestas Rápidas</TabsTrigger>
        <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary/20 data-[state=active]:text-foreground">WhatsApp</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <Card className="bg-card/80 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>
              Configura los parámetros básicos de tu asistente virtual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-10">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Conectando con la API de configuración del asistente...
              </p>
              <p className="text-sm text-muted-foreground">
                Esta función estará disponible próximamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="messages" className="space-y-4">
        <Card className="bg-card/80 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Mensajes Automáticos</CardTitle>
            <CardDescription>
              Personaliza los mensajes que tu asistente enviará automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-10">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Conectando con la API de mensajes automáticos...
              </p>
              <p className="text-sm text-muted-foreground">
                Esta función estará disponible próximamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="quick" className="space-y-4">
        <Card className="bg-card/80 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Respuestas Rápidas</CardTitle>
            <CardDescription>
              Configura respuestas predefinidas para preguntas comunes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Conectando con la API de respuestas rápidas...
              </p>
              <p className="text-sm text-muted-foreground">
                Esta función estará disponible próximamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="whatsapp" className="space-y-4">
        <Card className="bg-card/80 backdrop-blur-sm border-muted">
          <CardHeader>
            <CardTitle>Conversaciones de WhatsApp</CardTitle>
            <CardDescription>Visualiza y gestiona las conversaciones de tus clientes</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <ChatInterface />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AssistantConfig;
