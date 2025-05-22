
// Types for the human needed counter functionality
export interface UseHumanNeededCounterProps {
  onError?: (message: string) => void;
}

export interface UseHumanNeededCounterResult {
  count: number;
  loading: boolean;
  error: Error | null;
}
