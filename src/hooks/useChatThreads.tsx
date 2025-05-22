
import { useState, useEffect, useRef, useCallback } from "react";
import { useThreadManagement } from "./chat/useThreadManagement";
import { useConversationManagement } from "./chat/useConversationManagement";
import { THREAD_STATUSES } from "./chat/threadConstants";
import { UseChatThreadsReturn } from "./chat/types";

export { THREAD_STATUSES };
export type { ChatThread, ChatMessage, Conversation } from "./chat/types";

export function useChatThreads(assistantId?: string | null): UseChatThreadsReturn {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Use thread management hook
  const {
    threads,
    loadingThreads,
    error,
    fetchThreads,
    deleteThread,
    updateThreadStatus
  } = useThreadManagement({
    assistantId,
    statusFilter,
    setStatusFilter
  });
  
  // Use conversation management hook
  const {
    conversation,
    loadingConversation,
    fetchConversation,
    sendMessage
  } = useConversationManagement({
    selectedThread,
    assistantId
  });
  
  // Store refresh interval as ref to prevent it from causing effect reruns
  const REFRESH_INTERVAL = 5000; // 5 seconds in milliseconds
  
  // Use refs to store the interval IDs for cleanup
  const threadsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Select thread function
  const selectThread = useCallback((threadId: string) => {
    setSelectedThread(threadId);
    if (assistantId) {
      fetchConversation(threadId);
    }
  }, [fetchConversation, assistantId]);
  
  // Auto-refresh threads every 5 seconds
  useEffect(() => {
    if (!assistantId) return;
    
    // Clear any existing interval first
    if (threadsIntervalRef.current) {
      clearInterval(threadsIntervalRef.current);
      threadsIntervalRef.current = null;
    }
    
    // Initial fetch
    fetchThreads();
    
    // Set up the interval for threads refresh
    threadsIntervalRef.current = setInterval(() => {
      fetchThreads(true); // Silent refresh
    }, REFRESH_INTERVAL);
    
    // Clean up on unmount
    return () => {
      if (threadsIntervalRef.current) {
        clearInterval(threadsIntervalRef.current);
        threadsIntervalRef.current = null;
      }
    };
  }, [fetchThreads, assistantId]);
  
  // Auto-refresh the current conversation every 5 seconds if one is selected
  useEffect(() => {
    if (!selectedThread || !assistantId) return;
    
    // Clear any existing interval first
    if (conversationIntervalRef.current) {
      clearInterval(conversationIntervalRef.current);
      conversationIntervalRef.current = null;
    }
    
    // Initial fetch
    fetchConversation(selectedThread);
    
    // Set up the interval for conversation refresh
    conversationIntervalRef.current = setInterval(() => {
      fetchConversation(selectedThread);
    }, REFRESH_INTERVAL);
    
    // Clean up on unmount or when selected thread changes
    return () => {
      if (conversationIntervalRef.current) {
        clearInterval(conversationIntervalRef.current);
        conversationIntervalRef.current = null;
      }
    };
  }, [fetchConversation, selectedThread, assistantId]);

  return { 
    threads, 
    loadingThreads, 
    error, 
    fetchThreads, 
    selectedThread, 
    selectThread,
    conversation,
    loadingConversation,
    deleteThread,
    sendMessage,
    assistantId,
    statusFilter,
    setStatusFilter,
    updateThreadStatus,
    THREAD_STATUSES
  };
}
