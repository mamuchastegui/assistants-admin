
import React from "react";
import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/whatsapp/ChatInterface";
import { motion } from "framer-motion";

const AssistantConfig: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-[calc(100vh-200px)] min-h-[600px]"
    >
      <Card className="bg-card/80 backdrop-blur-sm border-muted shadow-lg overflow-hidden h-full">
        <ChatInterface />
      </Card>
    </motion.div>
  );
};

export default AssistantConfig;
