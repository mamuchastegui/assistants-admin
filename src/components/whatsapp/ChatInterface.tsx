
import React from "react";
import ChatThreadList from "@/components/whatsapp/ChatThreadList";
import WhatsAppMessages from "@/components/whatsapp/WhatsAppMessages";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
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

  // Handler for back button in mobile view
  const handleBackButton = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowThreadList(true);
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
    <div className="h-full flex overflow-hidden">
      {/* Thread list container */}
      <div className={cn(
        isMobile ? "absolute inset-0 z-30 w-full" : "w-[320px] min-w-[320px] border-r border-border/30",
        showThreadList ? "block" : "hidden", 
        "bg-card h-full"
      )} ref={threadListRef}>
        <ChatThreadList 
          threads={threads}
          loadingThreads={loadingThreads}
          error={error}
          fetchThreads={fetchThreads}
          selectedThread={selectedThread}
          selectThread={handleSelectThread}
        />
      </div>

      {/* Messages container */}
      <div className={cn(
        "h-full",
        isMobile ? "w-full" : showThreadList ? "flex-1" : "w-full",
        !showThreadList || !isMobile ? "block" : "hidden"
      )}>
        {/* Menu button for mobile */}
        {isMobile && !showThreadList && selectedThread && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackButton}
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
          onBack={handleBackButton}
          isMobileView={isMobile && !showThreadList}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
