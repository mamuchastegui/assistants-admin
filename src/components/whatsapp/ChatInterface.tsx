
import React from "react";
import ChatThreadList from "./ChatThreadList";
import ConversationView from "./ConversationView";
import { ChatThread, Conversation } from "@/hooks/useChatThreads";

interface ChatInterfaceProps {
  threads: ChatThread[];
  loadingThreads: boolean;
  error: string | null;
  fetchThreads: () => void;
  selectedThread: string | null;
  selectThread: (threadId: string) => void;
  conversation: Conversation | null;
  loadingConversation: boolean;
  deleteThread?: (threadId: string) => Promise<void>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  threads,
  loadingThreads,
  error,
  fetchThreads,
  selectedThread,
  selectThread,
  conversation,
  loadingConversation,
  deleteThread
}) => {
  return (
    <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] w-full h-full">
      <div className="border-r dark:border-gray-700">
        <ChatThreadList
          threads={threads}
          loadingThreads={loadingThreads}
          error={error}
          fetchThreads={fetchThreads}
          selectedThread={selectedThread}
          selectThread={selectThread}
          deleteThread={deleteThread}
        />
      </div>
      <div className="flex-grow overflow-hidden">
        <ConversationView
          conversation={conversation}
          loading={loadingConversation}
          selectedThread={selectedThread}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
