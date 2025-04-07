
import React from "react";
import ChatThreadList from "@/components/whatsapp/ChatThreadList";
import WhatsAppMessages from "@/components/whatsapp/WhatsAppMessages";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ChatInterface: React.FC = () => {
  const { 
    threads, 
    loadingThreads, 
    error, 
    fetchThreads, 
    selectedThread, 
    selectThread,
    conversation,
    loadingConversation 
  } = useChatThreads();
  
  const isMobile = useIsMobile();
  const [showThreadList, setShowThreadList] = React.useState(!isMobile || !selectedThread);
  const threadListRef = React.useRef<HTMLDivElement>(null);

  // Effect to handle visibility of thread list based on screen width
  React.useEffect(() => {
    if (isMobile && selectedThread) {
      setShowThreadList(false);
    } else if (!isMobile) {
      setShowThreadList(true);
    }
  }, [selectedThread, isMobile]);

  // Handler for thread selection - on mobile, this will hide thread list
  const handleSelectThread = (threadId: string) => {
    selectThread(threadId);
    if (isMobile) {
      setShowThreadList(false);
    }
  };

  // Click outside handler for mobile
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && threadListRef.current && !threadListRef.current.contains(event.target as Node)) {
        // Don't close if we're clicking on the menu button
        const target = event.target as HTMLElement;
        if (target.closest('button') && target.closest('button')?.dataset?.action === 'menu') {
          return;
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, threadListRef]);

  return (
    <div className="relative h-full bg-gradient-to-br from-background to-accent/20 rounded-xl shadow-lg overflow-hidden">
      {/* Fixed height container to prevent scrolling issues */}
      <div className="h-full flex">
        {/* Thread list - fixed width for desktop, fixed position for mobile */}
        <AnimatePresence>
          {(showThreadList || !isMobile) && (
            <motion.div 
              ref={threadListRef}
              className={cn(
                isMobile ? "fixed inset-0 z-30" : "w-1/3 h-full",
                "bg-card/70 backdrop-blur-sm border-r border-border/30"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <ChatThreadList 
                threads={threads}
                loadingThreads={loadingThreads}
                error={error}
                fetchThreads={fetchThreads}
                selectedThread={selectedThread}
                selectThread={handleSelectThread}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages - take remaining width for desktop */}
        <div 
          className={cn(
            isMobile ? "w-full" : !showThreadList ? "w-full" : "w-2/3",
            "h-full"
          )}
        >
          {/* Only show menu button on mobile when in conversation view */}
          {isMobile && !showThreadList && selectedThread && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowThreadList(true)}
              data-action="menu"
              className="absolute top-3 left-3 z-40 bg-background/70 backdrop-blur-sm rounded-full h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <WhatsAppMessages 
            conversation={conversation}
            loadingConversation={loadingConversation}
            selectedThread={selectedThread}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
