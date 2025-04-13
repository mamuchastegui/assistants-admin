
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, MessageSquare, Search, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { ChatThread } from "@/hooks/useChatThreads";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ChatThreadListProps {
  threads: ChatThread[];
  loadingThreads: boolean;
  error: string | null;
  fetchThreads: () => void;
  selectedThread: string | null;
  selectThread: (threadId: string) => void;
  deleteThread?: (threadId: string) => Promise<void>;
}

const ChatThreadList: React.FC<ChatThreadListProps> = ({
  threads,
  loadingThreads,
  error,
  fetchThreads,
  selectedThread,
  selectThread,
  deleteThread
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (threadToDelete && deleteThread) {
      try {
        await deleteThread(threadToDelete);
        toast.success("Conversación eliminada correctamente");
      } catch (error) {
        console.error("Error deleting conversation:", error);
        toast.error("Error al eliminar la conversación");
      }
      setIsDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setThreadToDelete(null);
  };

  if (loadingThreads) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-primary" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">Cargando conversaciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <CardContent className="flex flex-col items-center justify-center h-64">
          <MessageSquare className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">Error al cargar las conversaciones</p>
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
          <MessageSquare className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground">No hay conversaciones</p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm shadow-lg border-muted md:border-r">
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b bg-gradient-to-r from-background to-muted/30">
          <div>
            <CardTitle className="text-sm sm:text-base">Conversaciones</CardTitle>
            <CardDescription className="text-xs">Listado de chats con clientes</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh} 
            className="hover:bg-primary/20 h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <div className="px-3 py-2 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              className="pl-8 bg-background/80 focus:bg-background transition-colors duration-200 h-8 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0 flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            {filteredThreads.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground text-xs sm:text-sm">No se encontraron contactos</p>
              </div>
            ) : (
              <div className="space-y-0.5 p-1">
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
                        className={`w-full justify-start p-2 h-auto transition-all duration-200 ${
                          isSelected 
                            ? "bg-secondary shadow-md" 
                            : "hover:bg-muted/50"
                        } rounded-lg my-0.5 group`}
                        onClick={() => selectThread(thread.thread_id)}
                      >
                        <div className="flex items-center w-full gap-2">
                          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-primary/20 shadow-sm">
                            <AvatarFallback className={`${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"} text-xs`}>
                              {getInitials(thread.profile_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start flex-grow overflow-hidden">
                            <span className={`font-medium text-xs ${isSelected ? "text-primary" : ""}`}>{displayName}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-full">
                              Último mensaje: {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                            </span>
                          </div>
                          {deleteThread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0 ml-auto"
                              onClick={(e) => handleDeleteClick(e, thread.thread_id)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Eliminar conversación</span>
                            </Button>
                          )}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatThreadList;
