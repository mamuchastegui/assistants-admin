import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuthApi } from "@/api/client";

export interface ChatThread {
  _id: string;
  thread_id: string;
  assistant_id: string;
  profile_name: string;
  source: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  thread_id: string;
  user_id: string;
  profile_name: string;
  assistant_id: string;
  conversation: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Thread status constants
export const THREAD_STATUSES = {
  NEW: "new",
  BOT_HANDLING: "bot_handling",
  HUMAN_NEEDED: "human_needed",
  HUMAN_ANSWERING: "human_answering",
  WAITING_USER: "waiting_user",
  RESOLVED: "resolved",
  ERROR: "error",
  ARCHIVED: "archived",
  EXPIRED: "expired"
};

export function useChatThreads(assistantId?: string | null) {
  const authApiClient = useAuthApi();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Add refs to store last fetch timestamps to avoid unnecessary UI updates
  const lastThreadsData = useRef<string>("");
  const lastConversationData = useRef<string>("");
  
  // Store refresh interval as ref to prevent it from causing effect reruns
  const REFRESH_INTERVAL = 5000; // 5 seconds in milliseconds
  
  // Use refs to track if refreshes are in progress to prevent overlapping calls
  const isRefreshingThreads = useRef(false);
  const isRefreshingConversation = useRef(false);
  
  // Use refs to store the interval IDs for cleanup
  const threadsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a ref to track last fetch time to ensure consistent intervals
  const lastThreadsFetchTime = useRef<number>(0);
  const lastConversationFetchTime = useRef<number>(0);
  
  // Add ref to store current conversation message count to detect changes
  const messageCountRef = useRef<number>(0);
  
  // Add ref to track when we've changed threads to force a full refresh
  const threadSwitchedRef = useRef<boolean>(false);

  const fetchThreads = useCallback(async (silent = false) => {
    // Don't try to fetch if we're already loading, if we've encountered an error,
    // if we don't have an assistant ID, or if another refresh is already in progress
    if (loadingThreads || !assistantId || isRefreshingThreads.current) return;
    
    // Check if enough time has passed since the last fetch
    const now = Date.now();
    if (!silent && now - lastThreadsFetchTime.current < REFRESH_INTERVAL) {
      return;
    }
    
    // Update the last fetch time
    lastThreadsFetchTime.current = now;
    
    // Set the refreshing flag to true
    isRefreshingThreads.current = true;
    
    try {
      if (!silent) {
        setLoadingThreads(true);
        setError(null);
      }

      const { data } = await authApiClient.get("/chat/threads", {
        headers: {
          "assistant-id": assistantId
        }
      });

      // Compare with previous data to avoid unnecessary updates
      const newDataString = JSON.stringify(data);
      if (newDataString !== lastThreadsData.current) {
        // Only update state if data has changed
        setThreads(data);
        lastThreadsData.current = newDataString;
      }
      
      if (!silent) {
        setLoadingThreads(false);
      }
    } catch (err) {
      console.error("Error fetching chat threads:", err);
      setError("Error fetching chat threads");
      if (!silent) {
        setLoadingThreads(false);
        toast.error("No se pudieron cargar las conversaciones");
      }
    } finally {
      // Reset the refreshing flag
      isRefreshingThreads.current = false;
    }
  }, [authApiClient, loadingThreads, assistantId]);

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
      setError(null);

      const { data } = await authApiClient.get(`/chat/threads/${threadId}`, {
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
      setError("Error fetching conversation");
      setLoadingConversation(false);
      toast.error("No se pudo cargar la conversación");
    } finally {
      // Reset the refreshing flag
      isRefreshingConversation.current = false;
    }
  }, [authApiClient, assistantId, conversation, loadingConversation]);

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
          role: "assistant",
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
        
        // Also refresh the threads list to update the latest message timestamp
        setTimeout(() => fetchThreads(true), 1500);
      }
      
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("No se pudo enviar el mensaje");
      return false;
    }
  }, [selectedThread, conversation, authApiClient, fetchConversation, fetchThreads, assistantId]);

  const selectThread = useCallback((threadId: string) => {
    // Reset our tracking refs when selecting a new thread
    threadSwitchedRef.current = true;
    messageCountRef.current = 0;
    lastConversationData.current = "";
    
    setSelectedThread(threadId);
    fetchConversation(threadId);
  }, [fetchConversation]);

  const deleteThread = useCallback(async (threadId: string) => {
    if (!assistantId) return;
    
    try {
      await authApiClient.delete(`/chat/threads/${threadId}`, {
        headers: {
          "assistant-id": assistantId
        }
      });

      // Update the local state to remove the deleted thread
      setThreads(prevThreads => prevThreads.filter(thread => thread.thread_id !== threadId));
      
      // If the deleted thread was selected, clear the selection
      if (selectedThread === threadId) {
        setSelectedThread(null);
        setConversation(null);
      }
      
    } catch (err) {
      console.error("Error deleting thread:", err);
      throw err;
    }
  }, [authApiClient, selectedThread, assistantId]);

  // New function to update thread status
  const updateThreadStatus = useCallback(async (threadId: string, status: string) => {
    if (!assistantId) return false;
    
    try {
      const { data } = await authApiClient.patch(`/chat/threads/${threadId}/status`, 
        { status },
        { headers: { "assistant-id": assistantId } }
      );
      
      // Update local state
      setThreads(prevThreads => prevThreads.map(thread => 
        thread.thread_id === threadId 
          ? { ...thread, status: status, updated_at: new Date().toISOString() }
          : thread
      ));
      
      toast.success(`Estado actualizado a: ${status}`);
      
      // If this was the selected thread, update the conversation too
      if (selectedThread === threadId) {
        fetchConversation(threadId);
      }
      
      return true;
    } catch (err) {
      console.error("Error updating thread status:", err);
      toast.error("No se pudo actualizar el estado de la conversación");
      return false;
    }
  }, [authApiClient, assistantId, selectedThread, fetchConversation]);

  // Get filtered and ordered threads
  const getFilteredThreads = useCallback(() => {
    // Create a copy of threads to avoid mutating the original
    let filteredThreads = [...threads];
    
    // Apply status filter if selected
    if (statusFilter) {
      filteredThreads = filteredThreads.filter(thread => thread.status === statusFilter);
    }
    
    // Apply priority ordering according to hierarchy
    filteredThreads.sort((a, b) => {
      // Define status priorities
      const statusPriority: {[key: string]: number} = {
        'human_needed': 1,
        'human_answering': 2,
        'error': 3,
        'bot_handling': 4, // Keep in priority order, but hide in UI
        'waiting_user': 5
      };
      
      // Get priorities or default to high number (lower priority)
      const priorityA = statusPriority[a.status] || 100;
      const priorityB = statusPriority[b.status] || 100;
      
      // Compare by status priority first
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort by updated_at (newest first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    
    return filteredThreads;
  }, [threads, statusFilter]);

  // Fetch threads when the assistant ID changes or on initial mount
  useEffect(() => {
    if (assistantId && (isInitialLoad || !threads.length)) {
      fetchThreads();
      setIsInitialLoad(false);
    }
  }, [fetchThreads, isInitialLoad, assistantId, threads.length]);

  return { 
    threads: getFilteredThreads(), 
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
