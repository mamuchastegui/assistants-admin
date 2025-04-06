import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { useAssistantConfig } from "@/hooks/useAssistantConfig";
import WhatsAppMessages from "@/components/whatsapp/WhatsAppMessages";
import ChatInterface from "@/components/whatsapp/ChatInterface";
import { toast } from "sonner";

const AssistantConfig: React.FC = () => {
  const { config, loading, saving, saveConfig } = useAssistantConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (config && !localConfig) {
      setLocalConfig(config);
    }
  }, [config, localConfig]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (!localConfig) return;
    
    setLocalConfig({
      ...localConfig,
      [field]: value
    });
  };

  const handleQuickResponseChange = (id: number, field: "trigger" | "response", value: string) => {
    if (!localConfig) return;
    
    setLocalConfig({
      ...localConfig,
      quickResponses: localConfig.quickResponses.map(qr => 
        qr.id === id ? { ...qr, [field]: value } : qr
      )
    });
  };

  const addQuickResponse = () => {
    if (!localConfig) return;
    
    const newId = localConfig.quickResponses.length 
      ? Math.max(...localConfig.quickResponses.map(qr => qr.id)) + 1 
      : 1;
    
    setLocalConfig({
      ...localConfig,
      quickResponses: [...localConfig.quickResponses, { id: newId, trigger: "", response: "" }]
    });
  };

  const removeQuickResponse = (id: number) => {
    if (!localConfig) return;
    
    setLocalConfig({
      ...localConfig,
      quickResponses: localConfig.quickResponses.filter(qr => qr.id !== id)
    });
  };

  const handleSave = async () => {
    if (!localConfig) return;
    
    const success = await saveConfig(localConfig);
    if (success) {
      toast.success("Configuración guardada correctamente");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div className="text-center py-10">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <p className="text-muted-foreground mb-4">No se pudo cargar la configuración</p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="messages">Mensajes Automáticos</TabsTrigger>
        <TabsTrigger value="quick">Respuestas Rápidas</TabsTrigger>
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>
              Configura los parámetros básicos de tu asistente virtual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="assistant-name">Nombre del Asistente</Label>
              <Input 
                id="assistant-name" 
                value={localConfig.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este nombre se mostrará a tus clientes en WhatsApp</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="business-description">Descripción del Negocio</Label>
              <Textarea 
                id="business-description" 
                value={localConfig.businessDescription}
                onChange={(e) => handleInputChange("businessDescription", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este texto se usará para que el asistente conozca tu negocio</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Modo Activo</h4>
                  <p className="text-sm text-muted-foreground">Activa o desactiva tu asistente virtual</p>
                </div>
                <Switch 
                  id="active-mode" 
                  checked={localConfig.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificaciones al Propietario</h4>
                  <p className="text-sm text-muted-foreground">Recibe notificaciones cuando un cliente interactúe</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={localConfig.notifyOwner}
                  onCheckedChange={(checked) => handleInputChange("notifyOwner", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Intervención Humana</h4>
                  <p className="text-sm text-muted-foreground">Permitir que tomes el control de la conversación cuando sea necesario</p>
                </div>
                <Switch 
                  id="human-intervention" 
                  checked={localConfig.allowHumanIntervention}
                  onCheckedChange={(checked) => handleInputChange("allowHumanIntervention", checked)}
                />
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="messages" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Mensajes Automáticos</CardTitle>
            <CardDescription>
              Personaliza los mensajes que tu asistente enviará automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="welcome-message">Mensaje de Bienvenida</Label>
              <Textarea 
                id="welcome-message" 
                rows={3}
                value={localConfig.welcomeMessage}
                onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará cuando un cliente escriba por primera vez</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="away-message">Mensaje Fuera de Horario</Label>
              <Textarea 
                id="away-message" 
                rows={3}
                value={localConfig.awayMessage}
                onChange={(e) => handleInputChange("awayMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará cuando recibas mensajes fuera del horario de atención</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="booking-confirmation">Confirmación de Reserva</Label>
              <Textarea 
                id="booking-confirmation" 
                rows={3}
                value={localConfig.bookingConfirmation}
                onChange={(e) => handleInputChange("bookingConfirmation", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará cuando se confirme una reserva</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="reminder-message">Recordatorio de Cita</Label>
              <Textarea 
                id="reminder-message" 
                rows={3}
                value={localConfig.reminderMessage}
                onChange={(e) => handleInputChange("reminderMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará como recordatorio 24h antes de la cita</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="followup-message">Mensaje de Seguimiento</Label>
              <Textarea 
                id="followup-message" 
                rows={3}
                value={localConfig.followupMessage}
                onChange={(e) => handleInputChange("followupMessage", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará después de que el cliente haya recibido el servicio</p>
            </div>
            
            <Button 
              className="w-full mt-4"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Mensajes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="quick" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Respuestas Rápidas</CardTitle>
              <CardDescription>
                Configura respuestas predefinidas para preguntas comunes
              </CardDescription>
            </div>
            <Button onClick={addQuickResponse}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Respuesta
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localConfig.quickResponses.map((qr) => (
                <div key={qr.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-5">
                      <Label htmlFor={`trigger-${qr.id}`}>Palabra Clave / Frase de Activación</Label>
                      <Input 
                        id={`trigger-${qr.id}`}
                        value={qr.trigger}
                        onChange={(e) => handleQuickResponseChange(qr.id, "trigger", e.target.value)}
                        placeholder="Ej: horarios, precios, ubicación"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeQuickResponse(qr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`response-${qr.id}`}>Respuesta</Label>
                    <Textarea 
                      id={`response-${qr.id}`}
                      value={qr.response}
                      onChange={(e) => handleQuickResponseChange(qr.id, "response", e.target.value)}
                      rows={3}
                      placeholder="Escribe la respuesta que se enviará automáticamente"
                    />
                  </div>
                </div>
              ))}
              
              {localConfig.quickResponses.length === 0 && (
                <div className="text-center py-10">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground mb-4">No hay respuestas rápidas configuradas</p>
                  <Button onClick={addQuickResponse}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Respuesta
                  </Button>
                </div>
              )}
            </div>
            
            {localConfig.quickResponses.length > 0 && (
              <Button 
                className="w-full mt-6"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Respuestas
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="whatsapp" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversaciones de WhatsApp</CardTitle>
            <CardDescription>Visualiza y gestiona las conversaciones de tus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatInterface />
          </CardContent>
        </Card>
        <WhatsAppMessages />
      </TabsContent>
    </Tabs>
  );
};

export default AssistantConfig;
