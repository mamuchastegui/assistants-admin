
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { MenuItem, Guest } from "@/types/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface GuestListProps {
  menus: MenuItem[];
}

const GuestList = ({ menus }: GuestListProps) => {
  const totalGuests = menus.reduce((total, menu) => 
    total + (menu.guests?.length || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Detalles del Menú y Comensales</CardTitle>
        </div>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
          Total: {totalGuests} comensales
        </span>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {menus.map((menu, index) => (
            <AccordionItem key={index} value={`menu-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex justify-between w-full pr-4">
                  <span>{menu.menu_name}</span>
                  <span className="text-muted-foreground">
                    {menu.quantity} × ${menu.unit_price.toLocaleString()} = ${menu.subtotal.toLocaleString()}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {menu.guests && menu.guests.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Requerimientos</TableHead>
                            <TableHead>Variación de Menú</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menu.guests.map((guest, guestIndex) => (
                            <TableRow key={guest.guest_id || `guest-${guestIndex}`}>
                              <TableCell className="font-medium">{guest.guest_name}</TableCell>
                              <TableCell>{guest.meal_time || "No especificado"}</TableCell>
                              <TableCell>
                                {guest.special_requirements ? (
                                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-1 rounded-md text-xs">
                                    {guest.special_requirements}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Sin requerimientos</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {guest.menu_variation_id ? (
                                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-md text-xs">
                                    Variación personalizada
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Menú estándar</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    No hay información de comensales para este menú
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default GuestList;
