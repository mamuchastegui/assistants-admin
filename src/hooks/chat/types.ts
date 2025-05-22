
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

export interface UseChatThreadsReturn {
  threads: ChatThread[];
  loadingThreads: boolean;
  error: string | null;
  fetchThreads: (silent?: boolean) => Promise<void>;
  selectedThread: string | null;
  selectThread: (threadId: string) => void;
  conversation: Conversation | null;
  loadingConversation: boolean;
  deleteThread: (threadId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  assistantId: string | null;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  updateThreadStatus: (threadId: string, status: string) => Promise<boolean>;
  THREAD_STATUSES: typeof import('./threadConstants').THREAD_STATUSES;
}
