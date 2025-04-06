
import React from "react";
import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/whatsapp/ChatInterface";

const AssistantConfig: React.FC = () => {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-muted">
      <ChatInterface />
    </Card>
  );
};

export default AssistantConfig;
