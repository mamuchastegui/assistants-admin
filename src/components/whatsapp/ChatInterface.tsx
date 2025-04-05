
import React from "react";
import ChatThreadList from "@/components/whatsapp/ChatThreadList";
import ConversationView from "@/components/whatsapp/ConversationView";

const ChatInterface: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <ChatThreadList />
      </div>
      <div className="md:col-span-2">
        <ConversationView />
      </div>
    </div>
  );
};

export default ChatInterface;
