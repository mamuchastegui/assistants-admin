
import { useState } from 'react';
import { toast } from 'sonner';
import { ChatMessage } from './useChatThreads';
import { useAuthApi } from '@/api/client';

interface UseConversationActionsProps {
  threadId: string | null;
  assistantId: string;
}

export function useConversationActions({ threadId, assistantId }: UseConversationActionsProps) {
  const authApiClient = useAuthApi();
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Send a text message to the conversation
  const sendMessage = async (content: string): Promise<ChatMessage | null> => {
    if (!threadId || !content.trim()) return null;
    
    try {
      setIsSending(true);
      
      // When ready to implement with real API:
      // const { data } = await authApiClient.post(`/chat/threads/${threadId}/messages`, 
      //   { content, role: 'assistant' },
      //   { headers: { 'assistant-id': assistantId } }
      // );
      
      // For now, we'll simulate a successful message send
      console.log(`Sending message to thread ${threadId}:`, content);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: ChatMessage = {
        role: 'assistant',
        content: content,
        timestamp: new Date().toISOString()
      };
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('No se pudo enviar el mensaje');
      return null;
    } finally {
      setIsSending(false);
    }
  };

  // Upload a file to the conversation
  const uploadFile = async (file: File): Promise<string | null> => {
    if (!threadId || !file) return null;
    
    try {
      setIsUploading(true);
      
      // When ready to implement with real API:
      // const formData = new FormData();
      // formData.append('file', file);
      // const { data } = await authApiClient.post(`/chat/threads/${threadId}/attachments`, 
      //   formData,
      //   { 
      //     headers: { 
      //       'assistant-id': assistantId,
      //       'Content-Type': 'multipart/form-data' 
      //     } 
      //   }
      // );
      
      console.log(`Uploading file to thread ${threadId}:`, file.name);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a simulated file URL
      const fileUrl = `https://example.com/files/${file.name}`;
      toast.success(`Archivo subido: ${file.name}`);
      
      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('No se pudo subir el archivo');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Record and send audio
  const sendAudio = async (audioBlob: Blob): Promise<string | null> => {
    if (!threadId || !audioBlob) return null;
    
    try {
      setIsUploading(true);
      
      // When ready to implement with real API:
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // const { data } = await authApiClient.post(`/chat/threads/${threadId}/audio`, 
      //   formData,
      //   { 
      //     headers: { 
      //       'assistant-id': assistantId,
      //       'Content-Type': 'multipart/form-data' 
      //     } 
      //   }
      // );
      
      console.log(`Sending audio to thread ${threadId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Audio enviado');
      return 'audio_message';
    } catch (error) {
      console.error('Error sending audio:', error);
      toast.error('No se pudo enviar el audio');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    sendMessage,
    uploadFile,
    sendAudio,
    isSending,
    isUploading
  };
}
