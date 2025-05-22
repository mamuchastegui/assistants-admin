
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ThreadStatusSelector from "../ThreadStatusSelector";

interface ConversationHeaderProps {
  profileName?: string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  currentThreadStatus: string;
  onStatusChange?: (threadId: string, status: string) => Promise<boolean>;
  selectedThread: string | null;
  isChangingStatus: boolean;
}

// Helper function to get initials from name
const getInitials = (name?: string | null) => {
  if (!name) return "WA";
  const nameParts = name.split(" ");
  if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
  return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
};

const STATUS_LABELS: { [key: string]: string } = {
  "new": "Nuevo",
  "bot_handling": "Bot atendiendo",
  "human_needed": "Requiere atención",
  "human_answering": "Respondiendo",
  "waiting_user": "Esperando usuario",
  "resolved": "Resuelto",
  "error": "Error",
  "archived": "Archivado",
  "expired": "Expirado"
};

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  profileName = "Usuario",
  onSearchChange,
  searchQuery,
  currentThreadStatus,
  onStatusChange,
  selectedThread,
  isChangingStatus
}) => {
  
  const handleStatusChange = async (status: string) => {
    if (!selectedThread || !onStatusChange) return;
    return await onStatusChange(selectedThread, status);
  };

  return (
    <div className="pb-2 border-b flex-shrink-0">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-lg flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>
                {getInitials(profileName)}
              </AvatarFallback>
            </Avatar>
            {profileName}
          </div>
          
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar..." 
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Status Badge and selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Estado:</span>
            <Badge variant="outline" className="font-semibold">
              {STATUS_LABELS[currentThreadStatus] || currentThreadStatus}
            </Badge>
          </div>
          
          {/* Status selector with better visibility */}
          {onStatusChange && (
            <div className="w-56">
              <ThreadStatusSelector
                currentStatus={currentThreadStatus}
                onStatusChange={handleStatusChange}
                disabled={isChangingStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
