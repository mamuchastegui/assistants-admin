
import { ChatThread } from './types';

/**
 * Filters and sorts threads based on search term and status filter
 */
export const getFilteredAndSortedThreads = (
  threads: ChatThread[], 
  statusFilter: string | null
): ChatThread[] => {
  // Create a copy of threads to avoid mutating the original
  let filteredThreads = [...threads];
  
  // Apply status filter if selected
  if (statusFilter) {
    filteredThreads = filteredThreads.filter(thread => thread.status === statusFilter);
  }
  
  // Apply priority ordering according to hierarchy
  filteredThreads.sort((a, b) => {
    // Define status priorities
    const statusPriority: {[key: string]: number} = {
      'human_needed': 1,
      'human_answering': 2,
      'error': 3,
      'bot_handling': 4,
      'waiting_user': 5
    };
    
    // Get priorities or default to high number (lower priority)
    const priorityA = statusPriority[a.status] || 100;
    const priorityB = statusPriority[b.status] || 100;
    
    // Compare by status priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by updated_at (newest first)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  
  return filteredThreads;
};
