
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, MessageSquare, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { ChatThread } from "@/hooks/useChatThreads";
import { motion } from "framer-motion";

interface ChatThreadListProps {
  threads: ChatThread[];
  loadingThreads: boolean;
  error: string | null;
  fetchThreads: () => void;
  selectedThread: string | null;
  selectThread: (threadId: string) => void;
}

const ChatThreadList: React.FC<ChatThreadListProps> = ({
  threads,
  loadingThreads,
  error,
  fetchThreads,
  selectedThread,
  selectThread
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleRefresh = () => {
    fetchThreads();
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "WA";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  };

  const filteredThreads = threads.filter(thread => 
    !searchTerm || 
    thread.profile_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingThreads) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando conversaciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <MessageSquare className="w-10 h-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Error al cargar las conversaciones</p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <MessageSquare className="w-10 h-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No hay conversaciones</p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm shadow-lg border-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-gradient-to-r from-background to-muted/30">
        <div>
          <CardTitle className="text-lg">Conversaciones</CardTitle>
          <CardDescription>Listado de chats con clientes</CardDescription>
        </div>
        <Button size="sm" variant="ghost" onClick={handleRefresh} className="hover:bg-primary/20">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <div className="p-4 border-b bg-muted/20">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            className="pl-8 bg-background/80 focus:bg-background transition-colors duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-[calc(100vh-14rem)]">
          {filteredThreads.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">No se encontraron contactos</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {filteredThreads.map((thread, index) => {
                const isSelected = selectedThread === thread.thread_id;
                const date = new Date(thread.updated_at);
                const displayName = thread.profile_name || "Usuario";
                
                return (
                  <motion.div
                    key={thread.thread_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Button
                      variant={isSelected ? "secondary" : "ghost"}
                      className={`w-full justify-start p-3 h-auto transition-all duration-200 ${
                        isSelected 
                          ? "bg-secondary shadow-md" 
                          : "hover:bg-muted/50"
                      } rounded-lg my-1`}
                      onClick={() => selectThread(thread.thread_id)}
                    >
                      <div className="flex items-center w-full">
                        <Avatar className="h-10 w-10 mr-3 ring-2 ring-primary/20 shadow-sm">
                          <AvatarFallback className={`${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {getInitials(thread.profile_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start flex-grow overflow-hidden">
                          <span className={`font-medium text-sm ${isSelected ? "text-primary" : ""}`}>{displayName}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-full">
                            Último mensaje: {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                          </span>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatThreadList;
