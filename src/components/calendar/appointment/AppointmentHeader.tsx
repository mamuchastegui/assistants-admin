
import React from "react";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

interface AppointmentHeaderProps {
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onResetForm: () => void;
}

const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  selectedDate,
  onPrevDay,
  onNextDay,
  onResetForm
}) => {
  return (
    <div className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle>Turnos</CardTitle>
        <CardDescription>
          {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </CardDescription>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onPrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <DialogTrigger asChild>
          <Button size="sm" onClick={onResetForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Turno
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
};

export default AppointmentHeader;
