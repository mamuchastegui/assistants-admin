
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { ChatThread } from "@/hooks/useChatThreads";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

// Import our new components
import ThreadItem from "./thread-list/ThreadItem";
import EmptyState from "./thread-list/EmptyState";
import DeleteConfirmDialog from "./thread-list/DeleteConfirmDialog";
import SearchBar from "./thread-list/SearchBar";
import StatusFilter from "./thread-list/StatusFilter";

interface ChatThreadListProps {
  threads: ChatThread[];
  loadingThreads: boolean;
  error: string | null;
  fetchThreads: () => void;
  selectedThread: string | null;
  selectThread: (threadId: string) => void;
  deleteThread?: (threadId: string) => Promise<void>;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

const ChatThreadList: React.FC<ChatThreadListProps> = ({
  threads,
  loadingThreads,
  error,
  fetchThreads,
  selectedThread,
  selectThread,
  deleteThread,
  statusFilter,
  setStatusFilter
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleRefresh = () => {
    fetchThreads();
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

  // Render loading, error, or empty states using our EmptyState component
  if (loadingThreads) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <EmptyState type="loading" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <EmptyState type="error" errorMessage={error} onRefresh={handleRefresh} />
      </Card>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <Card className="h-full bg-card/80 backdrop-blur-sm border-muted">
        <EmptyState type="empty" onRefresh={handleRefresh} />
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
          <div className="space-y-2">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <StatusFilter
              statusFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />
          </div>
        </div>
        
        <CardContent className="p-0 flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            {filteredThreads.length === 0 ? (
              <EmptyState type="no-results" />
            ) : (
              <div className="space-y-0.5 p-1">
                {filteredThreads.map((thread, index) => (
                  <ThreadItem
                    key={thread.thread_id}
                    thread={thread}
                    index={index}
                    isSelected={selectedThread === thread.thread_id}
                    onSelect={selectThread}
                    onDeleteClick={deleteThread ? handleDeleteClick : undefined}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default ChatThreadList;
