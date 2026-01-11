import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthApi } from '@/api/client';
import { Conversation, ChatMessage } from './types';
import { toast } from 'sonner';

interface UseConversationManagementProps {
  selectedThread: string | null;
  assistantId: string | null;
}

export const useConversationManagement = ({
  selectedThread,
  assistantId
}: UseConversationManagementProps) => {
  const authApiClient = useAuthApi();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  
  // Add refs for tracking state
  const lastConversationData = useRef<string>("");
  const lastConversationFetchTime = useRef<number>(0);
  const isRefreshingConversation = useRef(false);
  const messageCountRef = useRef<number>(0);
  const threadSwitchedRef = useRef<boolean>(false);
  
  const REFRESH_INTERVAL = 5000; // 5 seconds in milliseconds

  // Fetch conversation function
  const fetchConversation = useCallback(async (threadId: string) => {
    if (!threadId || !assistantId || isRefreshingConversation.current) return;
    
    // Check if enough time has passed since the last fetch
    const now = Date.now();
    if (now - lastConversationFetchTime.current < REFRESH_INTERVAL && !threadSwitchedRef.current) {
      return;
    }
    
    // Update the last fetch time
    lastConversationFetchTime.current = now;
    
    // Set the refreshing flag to true
    isRefreshingConversation.current = true;
    
    try {
      // Only show loading indicator on first load, not on refreshes
      if (!conversation || conversation.thread_id !== threadId) {
        setLoadingConversation(true);
        threadSwitchedRef.current = true; // Mark that we've switched threads
      }

      const { data } = await authApiClient.get(`/chat/threads/admin/${threadId}`, {
        headers: {
          "assistant-id": assistantId
        }
      });

      // Compare with previous conversation data to avoid unnecessary updates
      const newConversationString = JSON.stringify(data);
      
      if (newConversationString !== lastConversationData.current || threadSwitchedRef.current) {
        // Check if we need to keep scroll position (only update if message count changed)
        const oldMessageCount = messageCountRef.current;
        const newMessageCount = data?.conversation?.length || 0;
        
        // Only update conversation if there's a change or we've switched threads
        setConversation(prev => {
          // If it's a different thread or we don't have any data yet, replace entirely
          if (!prev || prev.thread_id !== threadId || threadSwitchedRef.current) {
            messageCountRef.current = newMessageCount;
            threadSwitchedRef.current = false; // Reset the thread switched flag
            return data;
          }
          
          // Otherwise, check if there are actually new messages
          if (newMessageCount > oldMessageCount) {
            // Update the message count ref
            messageCountRef.current = newMessageCount;
            return data;
          }
          
          // If no new messages, keep current state to prevent re-renders
          return prev;
        });
        
        lastConversationData.current = newConversationString;
      }
      
      if (loadingConversation) {
        setLoadingConversation(false);
      }
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setLoadingConversation(false);
    } finally {
      // Reset the refreshing flag
      isRefreshingConversation.current = false;
    }
  }, [authApiClient, assistantId, conversation, loadingConversation]);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedThread || !content.trim() || !assistantId) return false;
    
    try {
      // Call the API to send a message - changing 'content' to 'message' in the request body
      const { data } = await authApiClient.post(`/chat/threads/${selectedThread}/reply`, 
        { message: content },
        { headers: { "assistant-id": assistantId } }
      );
      
      // Update local conversation state
      if (conversation) {
        const newMessage: ChatMessage = {
          role: "assistant" as const,
          content,
          timestamp: new Date().toISOString()
        };
        
        setConversation(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            conversation: [...prev.conversation, newMessage],
            updated_at: new Date().toISOString()
          };
        });
        
        // After sending, refresh the conversation to get the server state
        setTimeout(() => fetchConversation(selectedThread), 1000);
      }
      
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("No se pudo enviar el mensaje");
      return false;
    }
  }, [selectedThread, conversation, authApiClient, fetchConversation, assistantId]);

  return {
    conversation,
    loadingConversation,
    fetchConversation,
    sendMessage
  };
};
