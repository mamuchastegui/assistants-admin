import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/whatsapp/ChatInterface";
import { motion } from "framer-motion";
import { useChatThreads } from "@/hooks/useChatThreads";
import AssistantSelector from "./AssistantSelector";

const AssistantConfig: React.FC = () => {
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);
  
  const { 
    threads, 
    loadingThreads, 
    error, 
    fetchThreads, 
    selectedThread, 
    selectThread,
    conversation,
    loadingConversation,
    deleteThread,
    statusFilter,
    setStatusFilter,
    updateThreadStatus,
    sendMessage
  } = useChatThreads(currentAssistantId);

  const handleAssistantChange = (assistantId: string) => {
    setCurrentAssistantId(assistantId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-[calc(100vh-200px)]" // Adjusted height to prevent overflow
    >
      <div className="mb-4">
        <AssistantSelector onAssistantChange={handleAssistantChange} />
      </div>
      
      <Card className="h-full shadow-md overflow-hidden">
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
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          assistantId={currentAssistantId}
          updateThreadStatus={updateThreadStatus}
          sendMessage={sendMessage}
        />
      </Card>
    </motion.div>
  );
};

export default AssistantConfig;
