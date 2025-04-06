
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface WhatsAppMessage {
  _id: string;
  phoneNumber: string;
  profileName?: string;
  body: string;
  direction: "inbound" | "outbound";
  status: "received" | "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  media?: { url: string; contentType: string; }[];
}

export function useWhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const limit = 20;

  const fetchMessages = useCallback(async (skipCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Since there is no actual API endpoint for whatsapp messages, 
      // we'll create mock data instead
      setTimeout(() => {
        // Mock data for demonstration
        const mockMessages: WhatsAppMessage[] = [
          {
            _id: "msg1",
            phoneNumber: "whatsapp:+34600000001",
            profileName: "Juan García",
            body: "Hola, ¿están abiertos hoy?",
            direction: "inbound",
            status: "received",
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            _id: "msg2",
            phoneNumber: "whatsapp:+34600000002",
            profileName: "María López",
            body: "¿A qué hora cierran?",
            direction: "inbound",
            status: "received",
            timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
          },
          {
            _id: "msg3",
            phoneNumber: "whatsapp:+34600000001",
            profileName: "Juan García",
            body: "Gracias por la información",
            direction: "inbound",
            status: "received",
            timestamp: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
          },
          {
            _id: "msg4",
            phoneNumber: "whatsapp:+34600000003",
            body: "Buenas tardes, ¿tienen disponibilidad para 4 personas?",
            direction: "inbound",
            status: "received",
            timestamp: new Date(Date.now() - 14400000).toISOString() // 4 hours ago
          }
        ];

        if (skipCount === 0) {
          setMessages(mockMessages);
        } else {
          setMessages(prev => [...prev, ...mockMessages]);
        }
        
        setHasMore(mockMessages.length === limit);
        setSkip(skipCount + mockMessages.length);
        setLoading(false);
      }, 1000); // Simulate network delay
      
    } catch (err) {
      console.error("Error fetching WhatsApp messages:", err);
      setError("Failed to load messages");
      setLoading(false);
      toast.error("No se pudieron cargar los mensajes de WhatsApp");
    }
  }, [limit]);

  const loadMore = useCallback(() => {
    fetchMessages(skip);
  }, [fetchMessages, skip]);

  const refreshMessages = useCallback(() => {
    setSkip(0);
    fetchMessages(0);
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, error, hasMore, loadMore, refreshMessages };
}
