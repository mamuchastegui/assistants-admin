
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Save, Plus, Trash2 } from "lucide-react";

const AssistantConfig: React.FC = () => {
  const [quickResponses, setQuickResponses] = useState([
    { id: 1, trigger: "hola", response: "¡Hola! ¿En qué puedo ayudarte hoy?" },
    { id: 2, trigger: "horarios", response: "Nuestro horario de atención es de lunes a viernes de 9:00 a 20:00 y sábados de 10:00 a 18:00." },
    { id: 3, trigger: "precios", response: "Puedes consultar nuestros precios en nuestra página web o te puedo dar información sobre algún servicio específico." },
  ]);

  const addQuickResponse = () => {
    const newId = quickResponses.length ? Math.max(...quickResponses.map(qr => qr.id)) + 1 : 1;
    setQuickResponses([...quickResponses, { id: newId, trigger: "", response: "" }]);
  };

  const removeQuickResponse = (id: number) => {
    setQuickResponses(quickResponses.filter(qr => qr.id !== id));
  };

  const updateQuickResponse = (id: number, field: "trigger" | "response", value: string) => {
    setQuickResponses(quickResponses.map(qr => 
      qr.id === id ? { ...qr, [field]: value } : qr
    ));
  };

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="messages">Mensajes Automáticos</TabsTrigger>
        <TabsTrigger value="quick">Respuestas Rápidas</TabsTrigger>
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
              <Input id="assistant-name" defaultValue="Asistente Virtual" />
              <p className="text-sm text-muted-foreground">Este nombre se mostrará a tus clientes en WhatsApp</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="business-description">Descripción del Negocio</Label>
              <Textarea id="business-description" defaultValue="Somos una peluquería con más de 10 años de experiencia ofreciendo servicios de calidad." />
              <p className="text-sm text-muted-foreground">Este texto se usará para que el asistente conozca tu negocio</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Modo Activo</h4>
                  <p className="text-sm text-muted-foreground">Activa o desactiva tu asistente virtual</p>
                </div>
                <Switch id="active-mode" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificaciones al Propietario</h4>
                  <p className="text-sm text-muted-foreground">Recibe notificaciones cuando un cliente interactúe</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Intervención Humana</h4>
                  <p className="text-sm text-muted-foreground">Permitir que tomes el control de la conversación cuando sea necesario</p>
                </div>
                <Switch id="human-intervention" defaultChecked />
              </div>
            </div>
            
            <Button className="w-full mt-4">
              <Save className="mr-2 h-4 w-4" />
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
                defaultValue="¡Hola! Soy el asistente virtual de [Nombre del Negocio]. ¿En qué puedo ayudarte hoy?" 
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará cuando un cliente escriba por primera vez</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="away-message">Mensaje Fuera de Horario</Label>
              <Textarea 
                id="away-message" 
                rows={3}
                defaultValue="Gracias por tu mensaje. En este momento estamos fuera de horario de atención. Te responderemos cuando regresemos." 
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará cuando recibas mensajes fuera del horario de atención</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="booking-confirmation">Confirmación de Reserva</Label>
              <Textarea 
                id="booking-confirmation" 
                rows={3}
                defaultValue="¡Tu reserva ha sido confirmada! Te esperamos el [fecha] a las [hora]. Si necesitas hacer algún cambio, házmelo saber." 
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará cuando se confirme una reserva</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="reminder-message">Recordatorio de Cita</Label>
              <Textarea 
                id="reminder-message" 
                rows={3}
                defaultValue="¡Hola! Te recordamos que tienes una cita mañana a las [hora]. ¡Te esperamos!" 
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará como recordatorio 24h antes de la cita</p>
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="followup-message">Mensaje de Seguimiento</Label>
              <Textarea 
                id="followup-message" 
                rows={3}
                defaultValue="¡Hola! Esperamos que hayas disfrutado de nuestro servicio. Nos encantaría conocer tu opinión. ¿Podrías calificarnos del 1 al 5?" 
              />
              <p className="text-sm text-muted-foreground">Este mensaje se enviará después de que el cliente haya recibido el servicio</p>
            </div>
            
            <Button className="w-full mt-4">
              <Save className="mr-2 h-4 w-4" />
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
              {quickResponses.map((qr) => (
                <div key={qr.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-5">
                      <Label htmlFor={`trigger-${qr.id}`}>Palabra Clave / Frase de Activación</Label>
                      <Input 
                        id={`trigger-${qr.id}`}
                        value={qr.trigger}
                        onChange={(e) => updateQuickResponse(qr.id, "trigger", e.target.value)}
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
                      onChange={(e) => updateQuickResponse(qr.id, "response", e.target.value)}
                      rows={3}
                      placeholder="Escribe la respuesta que se enviará automáticamente"
                    />
                  </div>
                </div>
              ))}
              
              {quickResponses.length === 0 && (
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
            
            {quickResponses.length > 0 && (
              <Button className="w-full mt-6">
                <Save className="mr-2 h-4 w-4" />
                Guardar Respuestas
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AssistantConfig;
