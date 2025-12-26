import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dumbbell,
  Plus,
  Calendar,
  Users,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Datos de ejemplo
const mockClasses = [
  {
    id: '1',
    name: 'Spinning',
    instructor: 'Laura Gomez',
    day: 'Lunes',
    time: '08:00',
    duration: 45,
    capacity: 20,
    enrolled: 18,
  },
  {
    id: '2',
    name: 'Yoga',
    instructor: 'Sofia Rodriguez',
    day: 'Lunes',
    time: '10:00',
    duration: 60,
    capacity: 15,
    enrolled: 12,
  },
  {
    id: '3',
    name: 'CrossFit',
    instructor: 'Martin Diaz',
    day: 'Martes',
    time: '07:00',
    duration: 50,
    capacity: 12,
    enrolled: 12,
  },
  {
    id: '4',
    name: 'Pilates',
    instructor: 'Carolina Ruiz',
    day: 'Martes',
    time: '18:00',
    duration: 45,
    capacity: 10,
    enrolled: 8,
  },
  {
    id: '5',
    name: 'Funcional',
    instructor: 'Diego Torres',
    day: 'Miercoles',
    time: '09:00',
    duration: 45,
    capacity: 15,
    enrolled: 10,
  },
];

const mockReservations = [
  {
    id: '1',
    memberName: 'Juan Perez',
    className: 'Spinning',
    date: '2025-01-27',
    time: '08:00',
    status: 'confirmed',
  },
  {
    id: '2',
    memberName: 'Maria Garcia',
    className: 'Yoga',
    date: '2025-01-27',
    time: '10:00',
    status: 'confirmed',
  },
  {
    id: '3',
    memberName: 'Carlos Lopez',
    className: 'CrossFit',
    date: '2025-01-28',
    time: '07:00',
    status: 'pending',
  },
];

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

const Classes = () => {
  const [selectedDay, setSelectedDay] = useState('Lunes');

  const filteredClasses = mockClasses.filter((c) => c.day === selectedDay);

  const totalClasses = mockClasses.length;
  const totalCapacity = mockClasses.reduce((acc, c) => acc + c.capacity, 0);
  const totalEnrolled = mockClasses.reduce((acc, c) => acc + c.enrolled, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clases</h1>
            <p className="text-muted-foreground">Gestiona las clases y reservas del gimnasio</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Clase
          </Button>
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
              <p className="text-xs text-muted-foreground">clases semanales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground">lugares disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscriptos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrolled}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((totalEnrolled / totalCapacity) * 100)}% ocupacion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Horario Semanal</TabsTrigger>
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
                      key={day}
                      variant={selectedDay === day ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>

                {/* Classes table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clase</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Duracion</TableHead>
                        <TableHead>Cupos</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No hay clases programadas para este dia
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClasses.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell className="font-medium">{classItem.name}</TableCell>
                            <TableCell>{classItem.instructor}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {classItem.time}
                              </div>
                            </TableCell>
                            <TableCell>{classItem.duration} min</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  classItem.enrolled >= classItem.capacity
                                    ? 'destructive'
                                    : classItem.enrolled >= classItem.capacity * 0.8
                                      ? 'secondary'
                                      : 'default'
                                }
                              >
                                {classItem.enrolled}/{classItem.capacity}
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
                                  <DropdownMenuItem>Ver inscriptos</DropdownMenuItem>
                                  <DropdownMenuItem>Editar clase</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Cancelar clase
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
                <CardTitle>Reservas Recientes</CardTitle>
                <CardDescription>Ultimas reservas realizadas por los miembros</CardDescription>
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
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">{reservation.memberName}</TableCell>
                          <TableCell>{reservation.className}</TableCell>
                          <TableCell>{reservation.date}</TableCell>
                          <TableCell>{reservation.time}</TableCell>
                          <TableCell>
                            <Badge
                              variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
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
                                <DropdownMenuItem>Confirmar</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Classes;
