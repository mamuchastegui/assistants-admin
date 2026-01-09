import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dumbbell,
  Plus,
  Calendar,
  Users,
  Clock,
  MoreHorizontal,
  User,
  Bell,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useGymClasses, GymClass, CreateClassInput } from '@/hooks/gym/useGymClasses';
import { useGymSchedules, GymSchedule, CreateScheduleInput } from '@/hooks/gym/useGymSchedules';
import { useGymBookings, GymBooking, CreateBookingInput } from '@/hooks/gym/useGymBookings';
import { useGymMembers } from '@/hooks/gym/useGymMembers';

const days = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miercoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sabado' },
  { value: 6, label: 'Domingo' },
];

const Classes = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedScheduleForBooking, setSelectedScheduleForBooking] = useState<GymSchedule | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Hooks
  const { useListClasses, useCreateClass, useDeleteClass } = useGymClasses();
  const { useListSchedules, useCreateSchedule, useDeleteSchedule, useScheduleAvailability } = useGymSchedules();
  const { useListBookings, useCreateBooking, useCancelBooking, useMarkAttendance } = useGymBookings();
  const { useListMembers } = useGymMembers();

  // Queries
  const { data: classesData, isLoading: classesLoading } = useListClasses();
  const { data: schedulesData, isLoading: schedulesLoading } = useListSchedules({ day_of_week: selectedDay });
  const { data: bookingsData, isLoading: bookingsLoading } = useListBookings({ date_from: bookingDate, date_to: bookingDate });
  const { data: membersData } = useListMembers({ status: 'active' });

  // Mutations
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();
  const markAttendance = useMarkAttendance();

  // Form states
  const [classForm, setClassForm] = useState<CreateClassInput>({
    name: '',
    description: '',
    duration_minutes: 60,
    max_capacity: 20,
    instructor: '',
    category: '',
    difficulty_level: 'all_levels',
    class_type: 'group',
  });

  const [scheduleForm, setScheduleForm] = useState<CreateScheduleInput>({
    class_id: '',
    day_of_week: 0,
    start_time: '09:00',
    end_time: '10:00',
    room: '',
  });

  const [bookingForm, setBookingForm] = useState<CreateBookingInput>({
    schedule_id: '',
    booking_date: '',
    member_id: '',
    schedule_reminder: true,
    reminder_hours_before: 2,
  });

  const classes = classesData?.classes || [];
  const schedules = schedulesData?.schedules || [];
  const bookings = bookingsData?.bookings || [];
  const members = membersData?.members || [];

  // Stats
  const totalClasses = classes.length;
  const totalCapacity = schedules.reduce((acc, s) => acc + s.capacity, 0);
  const todayBookings = bookings.filter(b => b.status === 'confirmed').length;

  const handleCreateClass = async () => {
    try {
      await createClass.mutateAsync(classForm);
      setIsClassDialogOpen(false);
      setClassForm({
        name: '',
        description: '',
        duration_minutes: 60,
        max_capacity: 20,
        instructor: '',
        category: '',
        difficulty_level: 'all_levels',
        class_type: 'group',
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await createSchedule.mutateAsync(scheduleForm);
      setIsScheduleDialogOpen(false);
      setScheduleForm({
        class_id: '',
        day_of_week: 0,
        start_time: '09:00',
        end_time: '10:00',
        room: '',
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedScheduleForBooking) return;
    try {
      await createBooking.mutateAsync({
        ...bookingForm,
        schedule_id: selectedScheduleForBooking.id,
        booking_date: bookingDate,
      });
      setIsBookingDialogOpen(false);
      setSelectedScheduleForBooking(null);
      setBookingForm({
        schedule_id: '',
        booking_date: '',
        member_id: '',
        schedule_reminder: true,
        reminder_hours_before: 2,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openBookingDialog = (schedule: GymSchedule) => {
    setSelectedScheduleForBooking(schedule);
    setIsBookingDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clases</h1>
            <p className="text-muted-foreground">Gestiona las clases y reservas del gimnasio</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsClassDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Clase
            </Button>
            <Button onClick={() => setIsScheduleDialogOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Nuevo Horario
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clases</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClasses}</div>
              <p className="text-xs text-muted-foreground">tipos de clases</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Hoy</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground">lugares disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings}</div>
              <p className="text-xs text-muted-foreground">confirmadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Horario Semanal</TabsTrigger>
            <TabsTrigger value="classes">Tipos de Clases</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Horario de Clases</CardTitle>
                <CardDescription>Selecciona un dia para ver las clases disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Day selector */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {days.map((day) => (
                    <Button
                      key={day.value}
                      variant={selectedDay === day.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>

                {/* Schedules table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clase</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Sala</TableHead>
                        <TableHead>Cupos</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedulesLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : schedules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No hay clases programadas para este dia
                          </TableCell>
                        </TableRow>
                      ) : (
                        schedules.map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell className="font-medium">{schedule.class_name}</TableCell>
                            <TableCell>{schedule.instructor || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {schedule.start_time} - {schedule.end_time}
                              </div>
                            </TableCell>
                            <TableCell>{schedule.room || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="default">
                                {schedule.capacity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openBookingDialog(schedule)}>
                                    <User className="mr-2 h-4 w-4" />
                                    Reservar miembro
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteSchedule.mutate(schedule.id)}
                                  >
                                    Eliminar horario
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Clases</CardTitle>
                <CardDescription>Administra los tipos de clases disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Duracion</TableHead>
                        <TableHead>Capacidad</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classesLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : classes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No hay clases creadas
                          </TableCell>
                        </TableRow>
                      ) : (
                        classes.map((gymClass) => (
                          <TableRow key={gymClass.id}>
                            <TableCell className="font-medium">{gymClass.name}</TableCell>
                            <TableCell>
                              <Badge variant={gymClass.class_type === 'group' ? 'default' : 'secondary'}>
                                {gymClass.class_type === 'group' ? 'Grupal' : '1:1'}
                              </Badge>
                            </TableCell>
                            <TableCell>{gymClass.duration_minutes} min</TableCell>
                            <TableCell>{gymClass.max_capacity}</TableCell>
                            <TableCell>{gymClass.instructor || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={gymClass.is_active ? 'default' : 'secondary'}>
                                {gymClass.is_active ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteClass.mutate(gymClass.id)}
                                  >
                                    Desactivar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Reservas</CardTitle>
                    <CardDescription>Reservas de clases</CardDescription>
                  </div>
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Miembro</TableHead>
                        <TableHead>Clase</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Recordatorio</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No hay reservas para esta fecha
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.member_name || booking.user_id}</TableCell>
                            <TableCell>{booking.class_name}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.start_time}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  booking.status === 'confirmed' ? 'default' :
                                  booking.status === 'attended' ? 'default' :
                                  booking.status === 'cancelled' ? 'destructive' : 'secondary'
                                }
                              >
                                {booking.status === 'confirmed' ? 'Confirmada' :
                                 booking.status === 'attended' ? 'Asistio' :
                                 booking.status === 'cancelled' ? 'Cancelada' :
                                 booking.status === 'no_show' ? 'No asistio' : booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {booking.reminder_scheduled_at ? (
                                <Badge variant="outline">
                                  <Bell className="h-3 w-3 mr-1" />
                                  {booking.reminder_sent ? 'Enviado' : 'Programado'}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {booking.status === 'confirmed' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => markAttendance.mutate({ bookingId: booking.id, status: 'attended' })}
                                      >
                                        Marcar asistencia
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => markAttendance.mutate({ bookingId: booking.id, status: 'no_show' })}
                                      >
                                        Marcar ausente
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => cancelBooking.mutate({ bookingId: booking.id })}
                                      >
                                        Cancelar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Class Dialog */}
        <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nueva Clase</DialogTitle>
              <DialogDescription>Crea un nuevo tipo de clase para el gimnasio</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Ej: Spinning, Yoga, CrossFit"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="class_type">Tipo</Label>
                  <Select
                    value={classForm.class_type}
                    onValueChange={(value: 'group' | 'individual') => setClassForm({ ...classForm, class_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group">Grupal</SelectItem>
                      <SelectItem value="individual">Individual (1:1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <Select
                    value={classForm.difficulty_level}
                    onValueChange={(value: any) => setClassForm({ ...classForm, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                      <SelectItem value="all_levels">Todos los niveles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duracion (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={classForm.duration_minutes}
                    onChange={(e) => setClassForm({ ...classForm, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacidad</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={classForm.max_capacity}
                    onChange={(e) => setClassForm({ ...classForm, max_capacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={classForm.instructor}
                  onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })}
                  placeholder="Nombre del instructor"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  placeholder="Descripcion de la clase"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClass} disabled={createClass.isPending || !classForm.name}>
                {createClass.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Clase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Horario</DialogTitle>
              <DialogDescription>Programa un horario recurrente para una clase</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="class">Clase</Label>
                <Select
                  value={scheduleForm.class_id}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, class_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una clase" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.class_type === 'group' ? 'Grupal' : '1:1'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="day">Dia</Label>
                <Select
                  value={scheduleForm.day_of_week.toString()}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Hora inicio</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">Hora fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Sala (opcional)</Label>
                <Input
                  id="room"
                  value={scheduleForm.room}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                  placeholder="Ej: Sala 1, Piscina"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending || !scheduleForm.class_id}>
                {createSchedule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Horario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Booking Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reservar Miembro</DialogTitle>
              <DialogDescription>
                {selectedScheduleForBooking && (
                  <>Reservar para {selectedScheduleForBooking.class_name} - {selectedScheduleForBooking.start_time}</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="booking_date">Fecha</Label>
                <Input
                  id="booking_date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member">Miembro</Label>
                <Select
                  value={bookingForm.member_id}
                  onValueChange={(value) => setBookingForm({ ...bookingForm, member_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un miembro" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.member_id} value={m.user_id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder"
                  checked={bookingForm.schedule_reminder}
                  onCheckedChange={(checked) => setBookingForm({ ...bookingForm, schedule_reminder: !!checked })}
                />
                <Label htmlFor="reminder">Enviar recordatorio por WhatsApp</Label>
              </div>
              {bookingForm.schedule_reminder && (
                <div className="grid gap-2">
                  <Label htmlFor="hours_before">Horas antes</Label>
                  <Select
                    value={bookingForm.reminder_hours_before?.toString()}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, reminder_hours_before: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBooking} disabled={createBooking.isPending || !bookingForm.member_id}>
                {createBooking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reservar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Classes;
