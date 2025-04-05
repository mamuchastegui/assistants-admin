
import React from "react";
import { useChatThreads } from "@/hooks/useChatThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ChatThreadList: React.FC = () => {
  const { threads, loadingThreads, error, fetchThreads, selectedThread, selectThread } = useChatThreads();

  const handleRefresh = () => {
    fetchThreads();
  };

  if (loadingThreads) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando conversaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <MessageSquare className="w-10 h-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Error al cargar las conversaciones</p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <MessageSquare className="w-10 h-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No hay conversaciones</p>
        <Button variant="outline" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Conversaciones</CardTitle>
          <CardDescription>Listado de chats con clientes</CardDescription>
        </div>
        <Button size="sm" variant="ghost" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {threads.map((thread) => {
            const isSelected = selectedThread === thread.thread_id;
            const date = new Date(thread.updated_at);
            
            return (
              <Button
                key={thread.thread_id}
                variant={isSelected ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${isSelected ? "bg-secondary" : ""}`}
                onClick={() => selectThread(thread.thread_id)}
              >
                <div className="flex items-center w-full">
                  <Avatar className="h-9 w-9 mr-2">
                    <AvatarFallback>
                      {thread.profile_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium text-sm">{thread.profile_name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatThreadList;
