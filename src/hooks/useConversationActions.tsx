
import { useState } from 'react';
import { toast } from 'sonner';
import { ChatMessage } from './useChatThreads';
import { useAuthApi } from '@/api/client';

interface UseConversationActionsProps {
  threadId: string | null;
  assistantId: string | null;
}

export function useConversationActions({ threadId, assistantId }: UseConversationActionsProps) {
  const authApiClient = useAuthApi();
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Send a text message to the conversation
  const sendMessage = async (content: string): Promise<ChatMessage | null> => {
    if (!threadId || !content.trim() || !assistantId) return null;
    
    try {
      setIsSending(true);
      
      // Call the actual API endpoint to reply to the thread
      const { data } = await authApiClient.post(`/chat/threads/${threadId}/reply`, 
        { content },
        { headers: { 'assistant-id': assistantId } }
      );
      
      console.log(`Message sent to thread ${threadId}:`, content);
      
      // Return the new message object from the API response or create one if not available
      const newMessage: ChatMessage = data?.message || {
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
    if (!threadId || !file || !assistantId) return null;
    
    try {
      setIsUploading(true);
      
      // When ready to implement with real API:
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await authApiClient.post(`/chat/threads/${threadId}/attachments`, 
        formData,
        { 
          headers: { 
            'assistant-id': assistantId,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      
      console.log(`Uploading file to thread ${threadId}:`, file.name);
      
      // Return the file URL from the API response
      const fileUrl = data?.url || `https://example.com/files/${file.name}`;
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
    if (!threadId || !audioBlob || !assistantId) return null;
    
    try {
      setIsUploading(true);
      
      // Prepare audio file for upload
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'audio.wav', { type: audioBlob.type });
      formData.append('audio', audioFile);
      
      const { data } = await authApiClient.post(`/chat/threads/${threadId}/audio`, 
        formData,
        { 
          headers: { 
            'assistant-id': assistantId,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );
      
      console.log(`Sending audio to thread ${threadId}`);
      
      toast.success('Audio enviado');
      return data?.id || 'audio_message';
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
