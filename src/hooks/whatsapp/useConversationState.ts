
import { useState, useRef } from "react";
import { ChatMessage } from "@/hooks/useChatThreads";
import { toast } from "sonner";
import { useConversationActions } from "@/hooks/useConversationActions";

interface PendingMessage {
  id: string;
  content: string;
  timestamp: string;
}

interface UseConversationStateProps {
  selectedThread: string | null;
  assistantId: string | null;
  onSendMessage: (content: string) => Promise<boolean>;
}

export const useConversationState = ({
  selectedThread,
  assistantId,
  onSendMessage
}: UseConversationStateProps) => {
  // Local state
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  
  // Refs
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the conversation actions hook for file uploads and audio
  const { uploadFile, sendAudio, isSending, isUploading } = useConversationActions({
    threadId: selectedThread,
    assistantId
  });

  const handleSendMessage = async () => {
    if (!message.trim() && !isRecording) return;
    
    if (isRecording) {
      // Handle recording scenario
      toggleRecording();
      return;
    }
    
    const messageContent = message.trim();
    setMessage(""); // Clear the input field immediately for better UX
    
    // Create a pending message to show immediately
    const pendingMessageId = Date.now().toString();
    const newPendingMessage = {
      id: pendingMessageId,
      content: messageContent,
      timestamp: new Date().toISOString()
    };
    
    // Add to pending messages
    setPendingMessages(prev => [...prev, newPendingMessage]);
    
    // Set waiting state
    setIsWaitingForResponse(true);
    
    // Set a timeout to detect if no response comes within 30 seconds
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    
    responseTimeoutRef.current = setTimeout(() => {
      setIsWaitingForResponse(false);
      toast.error("No se recibió respuesta del asistente en tiempo esperado");
    }, 30000); // 30 seconds timeout
    
    try {
      const result = await onSendMessage(messageContent);
      
      if (!result) {
        // Remove pending message if sending failed
        setPendingMessages(prev => prev.filter(msg => msg.id !== pendingMessageId));
        toast.error("No se pudo enviar el mensaje");
      }
      
      // The actual message removal will happen when new messages arrive in the conversation
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar el mensaje");
      // Remove pending message if there was an error
      setPendingMessages(prev => prev.filter(msg => msg.id !== pendingMessageId));
      setIsWaitingForResponse(false);
      
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
    }
  };

  const toggleRecording = async () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Grabando audio...");
      // Start recording logic would go here
    } else {
      // In a real implementation, you would capture the audio blob
      // For now, we'll simulate with a dummy blob
      try {
        const dummyBlob = new Blob(["dummy audio data"], { type: "audio/wav" });
        const result = await sendAudio(dummyBlob);
        if (result) {
          toast.success("Audio enviado");
        }
      } catch (error) {
        console.error("Error sending audio:", error);
        toast.error("Error al enviar el audio");
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileUrl = await uploadFile(file);
      if (fileUrl) {
        console.log("File uploaded successfully:", fileUrl);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
    }
  };

  const handleStatusChange = async (threadId: string, status: string) => {
    setIsChangingStatus(true);
    // This will be implemented by the parent component
    return false;
  };

  // Clean up on unmount
  const cleanup = () => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
  };

  // Reset state when message count changes
  const updateResponseState = (newMessages: ChatMessage[]) => {
    if (pendingMessages.length > 0 && newMessages.length > 0) {
      // If we got a response, clear the pending state
      setIsWaitingForResponse(false);
      setPendingMessages([]);
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
        responseTimeoutRef.current = null;
      }
    }
  };

  return {
    message,
    setMessage,
    isRecording,
    toggleRecording,
    searchQuery,
    setSearchQuery,
    isChangingStatus,
    setIsChangingStatus,
    pendingMessages,
    isWaitingForResponse,
    isSending,
    isUploading,
    handleSendMessage,
    handleFileUpload,
    updateResponseState,
    cleanup
  };
};
