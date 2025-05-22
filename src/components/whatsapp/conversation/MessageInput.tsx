
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Image, Send, Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import QuickResponses from "../QuickResponses";

interface MessageInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSendMessage: () => void;
  onRecordToggle: () => void;
  isRecording: boolean;
  isSending: boolean;
  isUploading: boolean;
  isWaitingForResponse: boolean;
  onFileUpload: (file: File) => Promise<void>;
  profileName?: string;
  currentUserName?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  onSendMessage,
  onRecordToggle,
  isRecording,
  isSending,
  isUploading,
  isWaitingForResponse,
  onFileUpload,
  profileName,
  currentUserName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await onFileUpload(files[0]);
    }
  };

  const handleQuickResponse = (responseText: string) => {
    setMessage(responseText);
    // Focus the input after setting the response
    const inputElement = document.querySelector('input[placeholder="Escribe un mensaje"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  return (
    <div className="border-t p-0 flex-shrink-0 min-h-[60px] bg-[#1F2C34]">
      <div className="flex items-center w-full px-2 py-1">
        <div className="flex items-center space-x-3 text-gray-400 px-2">
          <Smile 
            className="h-6 w-6 cursor-pointer hover:text-gray-200 transition-colors" 
            onClick={() => toast.info("Emoji selector")}
          />
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,audio/*,application/*"
            />
            <Paperclip 
              className="h-6 w-6 cursor-pointer hover:text-gray-200 transition-colors" 
              onClick={handleFileSelect}
            />
          </div>
          <Image 
            className="h-6 w-6 cursor-pointer hover:text-gray-200 transition-colors" 
            onClick={() => {
              fileInputRef.current?.click();
              fileInputRef.current?.setAttribute('accept', 'image/*');
            }}
          />
          <QuickResponses 
            onSelectResponse={handleQuickResponse} 
            profileName={profileName}
            currentUserName={currentUserName}
          />
        </div>

        <div className="flex-grow mx-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje"
            className="bg-[#2A3942] border-0 text-gray-100 placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isSending || isUploading || isWaitingForResponse}
          />
        </div>

        <div className="text-gray-400 pl-2">
          {isSending || isWaitingForResponse ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : message.trim() ? (
            <Send 
              className="h-6 w-6 cursor-pointer text-[#00A884] hover:text-[#02c499] transition-colors" 
              onClick={onSendMessage}
            />
          ) : (
            <Mic 
              className={`h-6 w-6 cursor-pointer ${isRecording ? 'text-red-500' : 'hover:text-gray-200'} transition-colors`}
              onClick={onRecordToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
