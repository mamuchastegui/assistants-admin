
import { useState, useEffect, useCallback } from "react";
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

  const fetchThreads = useCallback(async (silent = false) => {
    // Don't try to fetch if we're already loading or if we've encountered an error
    // or if we don't have an assistant ID
    if (loadingThreads || !assistantId) return;
    
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

      setThreads(data);
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
    }
  }, [authApiClient, loadingThreads, assistantId]);

  const fetchConversation = useCallback(async (threadId: string) => {
    if (!threadId || !assistantId) return;
    
    try {
      setLoadingConversation(true);
      setError(null);

      const { data } = await authApiClient.get(`/chat/threads/${threadId}`, {
        headers: {
          "assistant-id": assistantId
        }
      });

      setConversation(data);
      setLoadingConversation(false);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError("Error fetching conversation");
      setLoadingConversation(false);
      toast.error("No se pudo cargar la conversación");
    }
  }, [authApiClient, assistantId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedThread || !content.trim() || !assistantId) return false;
    
    try {
      // Call the API to send a message
      const { data } = await authApiClient.post(`/chat/threads/${selectedThread}/reply`, 
        { content },
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
        'bot_handling': 4,
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
    setStatusFilter
  };
}
