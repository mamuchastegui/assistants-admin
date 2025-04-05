
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface WhatsAppMessage {
  _id: string;
  phoneNumber: string;
  body: string;
  direction: "inbound" | "outbound";
  timestamp: string;
  status: "received" | "sent" | "delivered" | "read" | "failed";
  media?: {
    url: string;
    contentType: string;
    filename?: string;
  }[];
  profileName?: string;
  tenantId?: string;
}

export function useWhatsAppMessages(limit = 20) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchMessages = useCallback(async (skipMessages = 0, resetMessages = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using direct API call instead of calling non-existent Supabase function
      const response = await fetch(`https://api.condamind.com/whatsapp/messages?limit=${limit}&skip=${skipMessages}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const newMessages = await response.json() as WhatsAppMessage[];
      
      setMessages(prev => resetMessages ? newMessages : [...prev, ...newMessages]);
      setHasMore(newMessages.length === limit);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching WhatsApp messages:", err);
      setError(err.message);
      setLoading(false);
      toast.error("No se pudieron cargar los mensajes de WhatsApp");
    }
  }, [limit]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage * limit);
    }
  };

  const refreshMessages = () => {
    setPage(0);
    fetchMessages(0, true);
  };

  useEffect(() => {
    fetchMessages(0, true);
  }, [fetchMessages]);

  return { messages, loading, error, hasMore, loadMore, refreshMessages };
}
