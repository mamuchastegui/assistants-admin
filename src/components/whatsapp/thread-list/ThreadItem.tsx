
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChatThread } from "@/hooks/useChatThreads";
import StatusBadge from "./StatusBadge";

interface ThreadItemProps {
  thread: ChatThread;
  index: number;
  isSelected: boolean;
  onSelect: (threadId: string) => void;
  onDeleteClick?: (e: React.MouseEvent, threadId: string) => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ 
  thread, 
  index, 
  isSelected, 
  onSelect,
  onDeleteClick 
}) => {
  // Helper function to safely get initials from a name
  const getInitials = (name?: string | null) => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  const date = new Date(thread.updated_at);
  const displayName = thread.profile_name || "Usuario";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start p-2 h-auto transition-all duration-200 ${
          isSelected 
            ? "bg-secondary shadow-md" 
            : "hover:bg-muted/50"
        } rounded-lg my-0.5 group`}
        onClick={() => onSelect(thread.thread_id)}
      >
        <div className="flex items-center w-full gap-2">
          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/20 shadow-sm">
            <AvatarFallback className={`${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"} text-xs`}>
              {getInitials(thread.profile_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start flex-grow overflow-hidden">
            <div className="flex items-center justify-between w-full">
              <span className={`font-medium text-xs ${isSelected ? "text-primary" : ""}`}>{displayName}</span>
              {thread.status && <StatusBadge status={thread.status} />}
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-full">
              Último mensaje: {formatDistanceToNow(date, { addSuffix: true, locale: es })}
            </span>
          </div>
          {onDeleteClick && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0 ml-auto"
              onClick={(e) => onDeleteClick(e, thread.thread_id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Eliminar conversación</span>
            </Button>
          )}
        </div>
      </Button>
    </motion.div>
  );
};

export default ThreadItem;
