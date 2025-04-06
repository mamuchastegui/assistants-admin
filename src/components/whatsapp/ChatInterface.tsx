
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
    <div className="relative flex flex-col md:grid md:grid-cols-10 gap-0 h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] bg-gradient-to-br from-background to-accent/20 rounded-xl shadow-lg overflow-hidden">
      {/* Thread list */}
      <AnimatePresence mode="wait">
        {(showThreadList || !isMobile) && (
          <motion.div 
            ref={threadListRef}
            className={cn(
              isMobile ? "absolute inset-0 z-30" : "md:col-span-3 lg:col-span-3 border-r border-border/30",
              "bg-card/70 backdrop-blur-sm"
            )}
            initial={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
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

      {/* Messages */}
      <AnimatePresence mode="wait">
        {(!isMobile || !showThreadList) && (
          <motion.div 
            className={cn(
              isMobile ? "absolute inset-0 z-20" : "md:col-span-7 lg:col-span-7",
              "bg-card/70 backdrop-blur-sm"
            )}
            initial={isMobile ? { x: 300, opacity: 0 } : { opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: 300, opacity: 0 } : { opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Only show menu button on mobile when in conversation view */}
            {isMobile && !showThreadList && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThreadList(true)}
                data-action="menu"
                className="absolute top-3 left-3 z-30 bg-background/70 backdrop-blur-sm rounded-full h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            <WhatsAppMessages 
              conversation={conversation}
              loadingConversation={loadingConversation}
              selectedThread={selectedThread}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
