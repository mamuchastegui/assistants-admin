import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  HelpCircle,
  CreditCard,
  Dumbbell,
  CalendarCheck,
  Users,
  Bell,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bot,
  Phone
} from 'lucide-react';

const Documentation = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documentacion del Gym Assistant</h1>
            <p className="text-muted-foreground">Guia completa de funcionalidades del asistente de WhatsApp</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="membership">Membresias</TabsTrigger>
            <TabsTrigger value="plans">Planes</TabsTrigger>
            <TabsTrigger value="classes">Clases</TabsTrigger>
            <TabsTrigger value="escalation">Derivacion</TabsTrigger>
            <TabsTrigger value="reminders">Recordatorios</TabsTrigger>
          </TabsList>

          {/* FAQ Section */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  <CardTitle>Preguntas Frecuentes (FAQ)</CardTitle>
                </div>
                <CardDescription>
                  El asistente puede responder automaticamente las siguientes preguntas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FAQItem
                    question="Horarios del gimnasio"
                    answer="Obtiene los horarios configurados en la seccion de informacion del gimnasio"
                    function="get_gym_info()"
                  />
                  <FAQItem
                    question="Precios y planes disponibles"
                    answer="Lista todos los planes activos con sus precios y caracteristicas"
                    function="get_gym_info() + get_membership_status()"
                  />
                  <FAQItem
                    question="Clases disponibles"
                    answer="Muestra las clases por categoria (yoga, spinning, crossfit, etc.)"
                    function="get_classes(category)"
                  />
                  <FAQItem
                    question="Horarios de clases"
                    answer="Muestra el calendario de clases para los proximos 7 dias"
                    function="get_schedule(target_date, days)"
                  />
                  <FAQItem
                    question="Estado de mi membresia"
                    answer="Muestra estado actual, fecha de vencimiento y pagos pendientes"
                    function="get_membership_status()"
                  />
                  <FAQItem
                    question="Servicios y amenities"
                    answer="Lista servicios disponibles como duchas, lockers, estacionamiento"
                    function="get_gym_info()"
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Como configurar la informacion del gimnasio
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    La informacion que el bot usa para responder FAQ se configura en la base de datos.
                    Incluye: nombre, direccion, horarios, servicios, precios y redes sociales.
                    Contacta al equipo tecnico para actualizar esta informacion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Membership Section */}
          <TabsContent value="membership" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <CardTitle>Subscripcion de Membresia</CardTitle>
                </div>
                <CardDescription>
                  Flujo completo desde registro hasta pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Flow Diagram */}
                <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <FlowStep number={1} label="Registro" icon={<Users className="h-4 w-4" />} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <FlowStep number={2} label="Seleccion Plan" icon={<Dumbbell className="h-4 w-4" />} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <FlowStep number={3} label="Pago" icon={<CreditCard className="h-4 w-4" />} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <FlowStep number={4} label="Activo" icon={<CheckCircle2 className="h-4 w-4" />} />
                </div>

                {/* Registration */}
                <div className="space-y-4">
                  <h4 className="font-semibold">1. Registro de nuevos miembros</h4>
                  <p className="text-sm text-muted-foreground">
                    El bot puede registrar nuevos miembros recopilando la siguiente informacion:
                  </p>
                  <div className="grid gap-2 md:grid-cols-3">
                    <FieldBadge label="Nombre completo" required />
                    <FieldBadge label="Email" required />
                    <FieldBadge label="Telefono" required />
                    <FieldBadge label="Fecha de nacimiento" />
                    <FieldBadge label="Genero" />
                    <FieldBadge label="Direccion" />
                    <FieldBadge label="Contacto emergencia" />
                    <FieldBadge label="Condiciones medicas" />
                    <FieldBadge label="Objetivos fitness" />
                  </div>
                  <code className="block p-2 bg-muted rounded text-xs">
                    Funcion: register_member(first_name, last_name, email, phone, ...)
                  </code>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Estados de membresia</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500">ACTIVE - Membresia vigente</Badge>
                    <Badge className="bg-gray-500">INACTIVE - Sin membresia</Badge>
                    <Badge className="bg-yellow-500">SUSPENDED - Suspendida temporalmente</Badge>
                    <Badge className="bg-red-500">EXPIRED - Vencida</Badge>
                    <Badge className="bg-blue-500">PENDING - Pendiente de pago</Badge>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <h4 className="font-semibold">2. Pagos con MercadoPago</h4>
                  <p className="text-sm text-muted-foreground">
                    El bot puede generar links de pago de MercadoPago para:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Inscripcion inicial (ENROLLMENT)</li>
                    <li>Pago de membresia (MEMBERSHIP)</li>
                    <li>Renovacion (RENEWAL)</li>
                    <li>Clases individuales (CLASS)</li>
                    <li>Entrenamiento personal (PERSONAL_TRAINING)</li>
                  </ul>
                  <code className="block p-2 bg-muted rounded text-xs">
                    Funcion: create_membership_payment(plan_id, payment_type, payment_method)
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Section */}
          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-purple-500" />
                  <CardTitle>Planes de Entrenamiento</CardTitle>
                </div>
                <CardDescription>
                  Creacion y asignacion de rutinas personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Desde el Admin</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Crear planes de entrenamiento
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Definir ejercicios, series y repeticiones
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Asignar planes a miembros
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Duplicar planes existentes
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Para el Miembro (via WhatsApp)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Ver su plan activo
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Ver sesiones proximas
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Marcar sesiones completadas
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Ver records personales (PRs)
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                    Endpoints disponibles
                  </h4>
                  <div className="grid gap-2 text-xs font-mono">
                    <code>GET /gym/workouts/plans - Listar planes</code>
                    <code>POST /gym/workouts/plans - Crear plan</code>
                    <code>POST /gym/workouts/plans/:id/assign - Asignar a miembro</code>
                    <code>GET /gym/workouts/me/active - Plan activo del miembro</code>
                    <code>GET /gym/workouts/me/upcoming - Sesiones proximas</code>
                    <code>POST /gym/workouts/sessions/:id/complete - Marcar completada</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Section */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-orange-500" />
                  <CardTitle>Reserva de Clases</CardTitle>
                </div>
                <CardDescription>
                  Sistema de reservas via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booking Flow */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Flujo de reserva</h4>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Usuario pregunta por clases</p>
                        <p className="text-sm text-muted-foreground">"Que clases hay disponibles?" o "Quiero reservar yoga"</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Bot muestra horarios disponibles</p>
                        <code className="text-xs">get_schedule(target_date, days=7)</code>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium">Bot verifica disponibilidad</p>
                        <code className="text-xs">check_availability(schedule_id, target_date)</code>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <div>
                        <p className="font-medium">Usuario confirma reserva</p>
                        <code className="text-xs">book_class(schedule_id, target_date, notes)</code>
                      </div>
                    </li>
                  </ol>
                </div>

                {/* Cancellation */}
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">
                      Politica de Cancelacion
                    </h4>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Los miembros pueden cancelar hasta <strong>2 horas antes</strong> de la clase.
                    Pasado ese tiempo, la cancelacion no es posible automaticamente y requiere intervencion del staff.
                  </p>
                  <code className="block mt-2 text-xs">cancel_booking(booking_id, reason)</code>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Gestion de capacidad</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cada clase tiene capacidad maxima definida</li>
                    <li>• El bot verifica disponibilidad antes de reservar</li>
                    <li>• Sistema de lista de espera (WAITLIST) cuando esta llena</li>
                    <li>• Tracking de asistencia: CONFIRMED, ATTENDED, NO_SHOW</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escalation Section */}
          <TabsContent value="escalation" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-500" />
                  <CardTitle>Derivacion con Humanos</CardTitle>
                </div>
                <CardDescription>
                  Cuando el bot escala a un agente humano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Function */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Funcion de escalado
                  </h4>
                  <code className="block text-sm">
                    escalate_to_human(reason: string, context_data?: object)
                  </code>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    Crea una notificacion para el staff del gimnasio con el contexto de la conversacion.
                  </p>
                </div>

                {/* When to escalate */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Cuando el bot escala automaticamente</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <EscalationReason
                      reason="Quejas o reclamos"
                      description="Cuando el usuario expresa insatisfaccion o quiere hacer una queja formal"
                    />
                    <EscalationReason
                      reason="Problemas de pago"
                      description="Disputas, reembolsos o problemas con MercadoPago"
                    />
                    <EscalationReason
                      reason="Solicitudes especiales"
                      description="Congelamiento de membresia, cambios de plan complejos"
                    />
                    <EscalationReason
                      reason="Informacion no disponible"
                      description="Preguntas que el bot no puede responder"
                    />
                    <EscalationReason
                      reason="Emergencias medicas"
                      description="Reportes de lesiones o incidentes"
                    />
                    <EscalationReason
                      reason="Usuario lo solicita"
                      description="Cuando pide explicitamente hablar con un humano"
                    />
                  </div>
                </div>

                {/* Notification */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Sistema de notificaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Cuando se escala una conversacion:
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Se crea una notificacion en el panel de admin</li>
                    <li>Se marca la conversacion como "pendiente de atencion"</li>
                    <li>El staff puede ver el historial completo de la conversacion</li>
                    <li>El staff puede responder desde el panel de WhatsApp</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Section */}
          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Recordatorios y Notificaciones</CardTitle>
                </div>
                <CardDescription>
                  Alertas automaticas para el admin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <ReminderCard
                    title="Membresias por Vencer"
                    description="Lista de miembros cuya membresia vence en los proximos N dias"
                    endpoint="GET /api/gym/members/expiring?days_ahead=7"
                    frequency="Diario"
                  />
                  <ReminderCard
                    title="Pagos Pendientes"
                    description="Pagos que estan pendientes de completar"
                    endpoint="GET /api/gym/payments/pending"
                    frequency="Diario"
                  />
                  <ReminderCard
                    title="Pagos Vencidos"
                    description="Pagos que pasaron su fecha de vencimiento"
                    endpoint="GET /api/gym/payments/overdue"
                    frequency="Diario"
                  />
                  <ReminderCard
                    title="Estadisticas de Check-in"
                    description="Resumen de asistencia del dia"
                    endpoint="GET /api/gym/checkins/today"
                    frequency="Tiempo real"
                  />
                  <ReminderCard
                    title="Nuevos Registros"
                    description="Notificacion cuando un miembro se registra via WhatsApp"
                    endpoint="Evento: register_member()"
                    frequency="Tiempo real"
                  />
                  <ReminderCard
                    title="Escalados Pendientes"
                    description="Conversaciones que requieren atencion humana"
                    endpoint="Evento: escalate_to_human()"
                    frequency="Tiempo real"
                  />
                </div>

                {/* Check-in stats */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Estadisticas de Check-in disponibles
                  </h4>
                  <div className="grid gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>• Horas pico de asistencia</p>
                    <p>• Distribucion por metodo (QR, WhatsApp, Manual, etc.)</p>
                    <p>• Frecuencia de visitas por miembro</p>
                    <p>• Racha actual de asistencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle>Referencia Rapida - Funciones del Bot</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
              <FunctionRef name="get_gym_info()" desc="Info del gimnasio" />
              <FunctionRef name="get_classes(category)" desc="Listar clases" />
              <FunctionRef name="get_schedule(date, days)" desc="Horarios" />
              <FunctionRef name="check_availability(id, date)" desc="Verificar cupo" />
              <FunctionRef name="book_class(id, date, notes)" desc="Reservar clase" />
              <FunctionRef name="cancel_booking(id, reason)" desc="Cancelar reserva" />
              <FunctionRef name="get_my_bookings(past)" desc="Mis reservas" />
              <FunctionRef name="register_member(...)" desc="Registrar miembro" />
              <FunctionRef name="get_membership_status()" desc="Estado membresia" />
              <FunctionRef name="create_membership_payment(...)" desc="Crear pago" />
              <FunctionRef name="get_payment_history(status, limit)" desc="Historial pagos" />
              <FunctionRef name="record_member_checkin(method)" desc="Hacer check-in" />
              <FunctionRef name="update_member_info(...)" desc="Actualizar perfil" />
              <FunctionRef name="escalate_to_human(reason, context)" desc="Derivar a humano" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Helper Components
const FAQItem = ({ question, answer, function: func }: { question: string; answer: string; function: string }) => (
  <div className="p-4 border rounded-lg space-y-2">
    <div className="flex items-start gap-2">
      <MessageSquare className="h-4 w-4 text-blue-500 mt-1" />
      <p className="font-medium">{question}</p>
    </div>
    <p className="text-sm text-muted-foreground pl-6">{answer}</p>
    <code className="block text-xs text-muted-foreground pl-6">{func}</code>
  </div>
);

const FlowStep = ({ number, label, icon }: { number: number; label: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
      {number}
    </div>
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const FieldBadge = ({ label, required }: { label: string; required?: boolean }) => (
  <Badge variant={required ? "default" : "secondary"} className="justify-start">
    {label}
    {required && <span className="ml-1 text-red-300">*</span>}
  </Badge>
);

const EscalationReason = ({ reason, description }: { reason: string; description: string }) => (
  <div className="p-3 border rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <p className="font-medium text-sm">{reason}</p>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const ReminderCard = ({ title, description, endpoint, frequency }: {
  title: string;
  description: string;
  endpoint: string;
  frequency: string;
}) => (
  <div className="p-4 border rounded-lg space-y-2">
    <div className="flex items-center justify-between">
      <p className="font-medium">{title}</p>
      <Badge variant="outline" className="text-xs">{frequency}</Badge>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
    <code className="block text-xs text-muted-foreground">{endpoint}</code>
  </div>
);

const FunctionRef = ({ name, desc }: { name: string; desc: string }) => (
  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
    <code className="text-xs font-mono">{name}</code>
    <span className="text-xs text-muted-foreground">- {desc}</span>
  </div>
);

export default Documentation;
