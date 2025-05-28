
export interface UseHumanNeededCounterProps {
  assistantId?: string;
  onError?: (error: string) => void;
}

export interface UseHumanNeededCounterResult {
  count: number;
  loading: boolean;
  error: Error | null;
}
