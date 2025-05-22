
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isUser: boolean;
  isPending?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  timestamp,
  isUser,
  isPending = false
}) => {
  const date = new Date(timestamp);
  
  return (
    <div
      className={`flex ${isUser ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 shadow-md ${
          isUser
            ? "bg-[#1F2C34] text-gray-100" // Dark gray for user messages
            : "bg-[#005C4B] text-white"    // Green for assistant messages
        } ${isPending ? "opacity-70" : ""}`}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        <div
          className={`text-xs mt-1 flex items-center justify-between ${
            isUser ? "text-gray-400" : "text-gray-200"
          }`}
        >
          <span>{format(date, "HH:mm - d MMM", { locale: es })}</span>
          {isPending && (
            <Loader2 className="h-3 w-3 ml-2 animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
