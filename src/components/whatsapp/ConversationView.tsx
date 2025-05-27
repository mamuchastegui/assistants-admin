
import React, { useEffect } from "react";
import { Conversation } from "@/hooks/useChatThreads";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { useConversationState } from "@/hooks/whatsapp/useConversationState";
import ConversationHeader from "./conversation/ConversationHeader";
import MessageList from "./conversation/MessageList";
import MessageInput from "./conversation/MessageInput";
import EmptyConversation from "./conversation/EmptyConversation";

interface ConversationViewProps {
  conversation: Conversation | null;
  loading: boolean;
  selectedThread: string | null;
  assistantId: string | null;
  currentThreadStatus?: string;
  onStatusChange?: (threadId: string, status: string) => Promise<boolean>;
}

const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversation, 
  loading, 
  selectedThread,
  assistantId,
  currentThreadStatus = "new",
  onStatusChange
}) => {
  const { user } = useAuth();
  
  const { 
    message,
    setMessage,
    isRecording,
    toggleRecording,
    searchQuery, 
    setSearchQuery,
    isChangingStatus,
    pendingMessages,
    isWaitingForResponse,
    isSending,
    isUploading,
    handleSendMessage,
    handleFileUpload,
    updateResponseState,
    cleanup
  } = useConversationState({
    selectedThread,
    assistantId,
    onSendMessage: async (messageContent) => {
      if (onStatusChange) {
        await onStatusChange(selectedThread!, "human_answering");
      }
      return conversation?.conversation ? true : false;
    }
  });

  // Update response state when conversation changes
  useEffect(() => {
    if (conversation?.conversation) {
      updateResponseState(conversation.conversation);
    }
    
    // Cleanup on unmount
    return cleanup;
  }, [conversation?.conversation]);

  // Filter messages based on search query
  const filteredMessages = conversation?.conversation 
    ? conversation.conversation.filter(message => 
        !searchQuery.trim() || message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const displayName = conversation?.profile_name || "Usuario";
  const currentUserName = user?.name || "Asistente";

  // Empty or loading states
  if (!selectedThread || !assistantId || loading) {
    return (
      <Card className="h-full flex flex-col">
        <EmptyConversation 
          isLoading={loading}
          selectedThread={selectedThread}
          assistantId={assistantId} 
        />
      </Card>
    );
  }

  if (!conversation || !conversation.conversation || conversation.conversation.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <EmptyConversation 
          selectedThread={selectedThread}
          assistantId={assistantId}
          noMessages={true} 
        />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b flex-shrink-0 p-4">
        <ConversationHeader 
          profileName={displayName}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          currentThreadStatus={currentThreadStatus}
          onStatusChange={onStatusChange}
          selectedThread={selectedThread}
          isChangingStatus={isChangingStatus}
        />
      </CardHeader>
      
      <CardContent className="p-0 flex-grow overflow-hidden">
        <MessageList 
          messages={filteredMessages}
          pendingMessages={pendingMessages}
          isWaitingForResponse={isWaitingForResponse}
        />
      </CardContent>
      
      <CardFooter className="p-0">
        <MessageInput 
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendMessage}
          onRecordToggle={toggleRecording}
          isRecording={isRecording}
          isSending={isSending}
          isUploading={isUploading}
          isWaitingForResponse={isWaitingForResponse}
          onFileUpload={handleFileUpload}
          profileName={displayName}
          currentUserName={currentUserName}
        />
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
