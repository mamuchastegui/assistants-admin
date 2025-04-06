
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface AppointmentProps {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AppointmentItem: React.FC<AppointmentProps> = ({ 
  id, time, client, service, duration, onEdit, onDelete 
}) => {
  return (
    <div className="p-3 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{time}</span>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                {duration} min
              </span>
            </div>
            <div className="mt-1">
              <p className="font-medium text-foreground">{client}</p>
              <p className="text-sm text-muted-foreground">{service}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(id)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(id)} 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentItem;
