
import React, { useState } from "react";
import ChatThreadList from "@/components/whatsapp/ChatThreadList";
import WhatsAppMessages from "@/components/whatsapp/WhatsAppMessages";
import { useChatThreads } from "@/hooks/useChatThreads";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
      <div className="md:col-span-1">
        <ChatThreadList 
          threads={threads}
          loadingThreads={loadingThreads}
          error={error}
          fetchThreads={fetchThreads}
          selectedThread={selectedThread}
          selectThread={selectThread}
        />
      </div>
      <div className="md:col-span-2">
        <WhatsAppMessages 
          conversation={conversation}
          loadingConversation={loadingConversation}
          selectedThread={selectedThread}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
