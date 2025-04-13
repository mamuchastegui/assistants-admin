
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

interface GuestListProps {
  menus: MenuItem[];
}

const GuestList = ({ menus }: GuestListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles del Menú y Comensales</CardTitle>
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Requerimientos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menu.guests && menu.guests.length > 0 ? (
                        menu.guests.map((guest, guestIndex) => (
                          <TableRow key={guest.guest_id || `guest-${guestIndex}`}>
                            <TableCell className="font-medium">{guest.guest_name}</TableCell>
                            <TableCell>{guest.meal_time}</TableCell>
                            <TableCell>
                              {guest.special_requirements ? guest.special_requirements : "Sin requerimientos especiales"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No hay información de comensales
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default GuestList;
