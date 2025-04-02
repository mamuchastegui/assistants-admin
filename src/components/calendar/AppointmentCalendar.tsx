
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

// Import components
import CalendarSidebar from "./CalendarSidebar";
import AppointmentList from "./appointment/AppointmentList";
import AppointmentForm from "./appointment/AppointmentForm";
import AppointmentHeader from "./appointment/AppointmentHeader";

// Import hooks
import { useAppointments } from "@/hooks/useAppointments";

const AppointmentCalendar: React.FC = () => {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  
  const {
    filteredAppointments,
    isLoading,
    formData,
    currentAppointment,
    refetch,
    createMutation,
    updateMutation,
    resetForm,
    handleFormChange,
    handleSelectChange,
    handleSaveNew,
    handleSaveEdit,
    handleEdit,
    handleDelete,
    setCurrentAppointment
  } = useAppointments(selectedDate);

  // Event handlers
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevDay = () => {
    setSelectedDate(new Date(selectedDate.getTime() - 86400000));
  };

  const handleNextDay = () => {
    setSelectedDate(new Date(selectedDate.getTime() + 86400000));
  };

  const syncWithDatabase = () => {
    refetch();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendar sidebar */}
      <CalendarSidebar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onSyncWithDatabase={syncWithDatabase}
        isLoading={isLoading}
      />

      {/* Appointments list */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <AppointmentHeader 
            selectedDate={selectedDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onResetForm={resetForm}
            onOpenNewDialog={() => setIsNewAppointmentOpen(true)}
          />
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={filteredAppointments}
            isLoading={isLoading}
            onEdit={(id) => {
              handleEdit(id);
              setIsEditAppointmentOpen(true);
            }}
            onDelete={handleDelete}
            onAddNew={() => setIsNewAppointmentOpen(true)}
          />
        </CardContent>
      </Card>

      {/* New appointment dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <AppointmentForm
          title="Nuevo Turno"
          description="Completa los detalles para crear un nuevo turno"
          formData={formData}
          selectedDate={selectedDate}
          isLoading={createMutation.isPending}
          onFormChange={handleFormChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleSaveNew}
        />
      </Dialog>

      {/* Edit appointment dialog */}
      <Dialog open={isEditAppointmentOpen} onOpenChange={setIsEditAppointmentOpen}>
        <AppointmentForm
          title="Editar Turno"
          description="Actualiza los detalles del turno"
          formData={formData}
          selectedDate={selectedDate}
          isLoading={updateMutation.isPending}
          onFormChange={handleFormChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleSaveEdit}
          idPrefix="edit"
        />
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
