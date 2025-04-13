
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface ChatThread {
  _id: string;
  thread_id: string;
  assistant_id: string;
  profile_name: string;
  source: string;
  created_at: string;
  updated_at: string;
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

const ASSISTANT_ID = "asst_OS4bPZIMBpvpYo2GMkG0ast5";

export function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoadingThreads(true);
      setError(null);

      const response = await fetch("https://api.condamind.com/chat/threads", {
        headers: {
          "assistant-id": ASSISTANT_ID
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setThreads(data);
      setLoadingThreads(false);
    } catch (err) {
      console.error("Error fetching chat threads:", err);
      setError(err.message);
      setLoadingThreads(false);
      toast.error("No se pudieron cargar las conversaciones");
    }
  }, []);

  const fetchConversation = useCallback(async (threadId: string) => {
    if (!threadId) return;
    
    try {
      setLoadingConversation(true);
      setError(null);

      const response = await fetch(`https://api.condamind.com/chat/threads/${threadId}`, {
        headers: {
          "assistant-id": ASSISTANT_ID
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setConversation(data);
      setLoadingConversation(false);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError(err.message);
      setLoadingConversation(false);
      toast.error("No se pudo cargar la conversación");
    }
  }, []);

  const selectThread = useCallback((threadId: string) => {
    setSelectedThread(threadId);
    fetchConversation(threadId);
  }, [fetchConversation]);

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`https://api.condamind.com/chat/threads/${threadId}`, {
        method: "DELETE",
        headers: {
          "assistant-id": ASSISTANT_ID
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

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
  }, [selectedThread]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { 
    threads, 
    loadingThreads, 
    error, 
    fetchThreads, 
    selectedThread, 
    selectThread,
    conversation,
    loadingConversation,
    deleteThread
  };
}
