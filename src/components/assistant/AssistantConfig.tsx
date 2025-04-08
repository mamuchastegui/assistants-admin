
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
      className="w-full h-[calc(100vh-180px)] min-h-[800px]" // Increased height for better scrolling
    >
      <Card className="h-full shadow-md flex flex-col">
        <div className="h-full flex-grow flex flex-col overflow-hidden">
          <ChatInterface />
        </div>
      </Card>
    </motion.div>
  );
};

export default AssistantConfig;
