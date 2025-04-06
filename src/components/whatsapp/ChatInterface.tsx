
import React from "react";
import ChatThreadList from "@/components/whatsapp/ChatThreadList";
import WhatsAppMessages from "@/components/whatsapp/WhatsAppMessages";

const ChatInterface: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
      <div className="md:col-span-1">
        <ChatThreadList />
      </div>
      <div className="md:col-span-2">
        <WhatsAppMessages />
      </div>
    </div>
  );
};

export default ChatInterface;
