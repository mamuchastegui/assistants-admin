
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthApi } from '@/api/client';
import { ChatThread } from './types';
import { toast } from 'sonner';
import { getFilteredAndSortedThreads } from './threadUtils';

interface UseThreadManagementProps {
  assistantId?: string | null;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
}

export const useThreadManagement = ({ 
  assistantId, 
  statusFilter,
  setStatusFilter
}: UseThreadManagementProps) => {
  const authApiClient = useAuthApi();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Add refs to store last fetch timestamps to avoid unnecessary UI updates
  const lastThreadsData = useRef<string>("");
  const lastThreadsFetchTime = useRef<number>(0);
  
  // Use ref to track if refreshes are in progress to prevent overlapping calls
  const isRefreshingThreads = useRef(false);

  // Fetch threads function
  const fetchThreads = useCallback(async (silent = false) => {
    // Don't try to fetch if we're already loading, if we've encountered an error,
    // if we don't have an assistant ID, or if another refresh is already in progress
    if (loadingThreads || !assistantId || isRefreshingThreads.current) return;
    
    // Check if enough time has passed since the last fetch
    const now = Date.now();
    const REFRESH_INTERVAL = 5000; // 5 seconds in milliseconds
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

      const { data } = await authApiClient.get("/chat/threads/by-assistant", {
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

  // Handle thread deletion
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
      return;
    } catch (err) {
      console.error("Error deleting thread:", err);
      throw err;
    }
  }, [authApiClient, assistantId]);

  // Update thread status
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
      return true;
    } catch (err) {
      console.error("Error updating thread status:", err);
      toast.error("No se pudo actualizar el estado de la conversación");
      return false;
    }
  }, [authApiClient, assistantId]);

  // Get filtered threads
  const getFilteredThreads = useCallback(() => {
    return getFilteredAndSortedThreads(threads, statusFilter);
  }, [threads, statusFilter]);

  // Fetch threads on initial load or when assistant ID changes
  useEffect(() => {
    if (assistantId && (isInitialLoad || !threads.length)) {
      fetchThreads();
      setIsInitialLoad(false);
    }
  }, [fetchThreads, isInitialLoad, assistantId, threads.length]);

  return {
    threads: getFilteredThreads(),
    rawThreads: threads,
    loadingThreads,
    error,
    fetchThreads,
    deleteThread,
    updateThreadStatus
  };
};
