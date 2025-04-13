
import React from "react";
import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/whatsapp/ChatInterface";
import { motion } from "framer-motion";
import { useChatThreads } from "@/hooks/useChatThreads";

const AssistantConfig: React.FC = () => {
  const { 
    threads, 
    loadingThreads, 
    error, 
    fetchThreads, 
    selectedThread, 
    selectThread,
    conversation,
    loadingConversation,
    deleteThread 
  } = useChatThreads();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-[calc(100vh-180px)] min-h-[800px]" // Maintained height for better view
    >
      <Card className="h-full shadow-md flex flex-col">
        <div className="h-full flex-grow flex flex-col overflow-hidden">
          <ChatInterface 
            threads={threads}
            loadingThreads={loadingThreads}
            error={error}
            fetchThreads={fetchThreads}
            selectedThread={selectedThread}
            selectThread={selectThread}
            conversation={conversation}
            loadingConversation={loadingConversation}
            deleteThread={deleteThread}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default AssistantConfig;
