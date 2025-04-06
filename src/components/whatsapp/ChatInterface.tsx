
import React from "react";
import ChatThreadList from "@/components/whatsapp/ChatThreadList";
import WhatsAppMessages from "@/components/whatsapp/WhatsAppMessages";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Effect to handle visibility of thread list on mobile
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

  // Handler to go back to thread list on mobile
  const handleBackToThreads = () => {
    if (isMobile) {
      setShowThreadList(true);
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-10rem)] sm:h-[calc(100vh-10rem)] bg-gradient-to-br from-background to-accent/20 p-2 sm:p-4 rounded-xl shadow-lg overflow-hidden animate-fade-in">
      <AnimatePresence>
        {(showThreadList || !isMobile) && (
          <motion.div 
            className={`${isMobile ? "absolute inset-0 z-10 p-2" : "md:col-span-1"} transform transition-all duration-300 ease-in-out hover:scale-[1.01]`}
            initial={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
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

      <AnimatePresence>
        {(!isMobile || !showThreadList || !selectedThread) && (
          <motion.div 
            className={`${isMobile ? "absolute inset-0 z-10" : "md:col-span-2"} transform transition-all duration-300 ease-in-out`}
            initial={isMobile ? { x: 300, opacity: 0 } : { opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: 300, opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobile && selectedThread && !showThreadList && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToThreads}
                className="absolute top-3 left-3 z-20 bg-background/70 backdrop-blur-sm rounded-full h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
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
