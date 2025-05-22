import React from 'react';
import { useNotifications } from '@/providers/NotificationsProvider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Loader2, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  className?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ className }) => {
  const { count, loading, error } = useNotifications();
  const navigate = useNavigate();
  
  const handleViewRequests = () => {
    navigate('/assistant');
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Notificaciones
        </CardTitle>
        <CardDescription>Solicitudes que requieren atención humana</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {renderNotificationContent()}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
  
  // Función para renderizar el contenido apropiado según el estado
  function renderNotificationContent() {
    if (loading) {
      return (
        <motion.div 
          key="loading"
          className="flex flex-col items-center justify-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
        </motion.div>
      );
    }
    
    if (error) {
      return (
        <motion.div 
          key="error"
          className="flex flex-col items-center justify-center py-6 text-destructive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p className="text-sm">Error de conexión con el servicio de notificaciones</p>
          <p className="text-xs text-muted-foreground mt-2">Reconectando automáticamente...</p>
        </motion.div>
      );
    }
    
    if (count > 0) {
      return (
        <motion.div 
          key="has-notifications"
          className="flex flex-col items-center justify-center py-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <NotificationPulse count={count} />
          
          <Button 
            onClick={handleViewRequests}
            className="transition-all"
          >
            Ver solicitudes
          </Button>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        key="no-notifications"
        className="flex flex-col items-center justify-center py-6 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Bell className="h-8 w-8 mb-2 text-muted-foreground/50" />
        <p className="text-sm">No hay solicitudes pendientes</p>
      </motion.div>
    );
  }
};

// Componente separado para la animación de pulso con contador
interface NotificationPulseProps {
  count: number;
}

const NotificationPulse: React.FC<NotificationPulseProps> = ({ count }) => {
  return (
    <>
      <motion.div 
        className="flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-3"
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 0 0 rgba(244, 67, 54, 0)",
            "0 0 0 10px rgba(244, 67, 54, 0.2)",
            "0 0 0 0 rgba(244, 67, 54, 0)"
          ]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        }}
      >
        <Users className="h-8 w-8 text-destructive" />
      </motion.div>
      
      <motion.span 
        className="text-3xl font-bold text-destructive mb-1"
        key={count}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        {count}
      </motion.span>
      
      <p className="text-sm text-center mb-4">
        {count === 1 ? 
          "Solicitud pendiente requiere atención humana" : 
          `Solicitudes pendientes requieren atención humana`}
      </p>
    </>
  );
};

export default NotificationPanel;
