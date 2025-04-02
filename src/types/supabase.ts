
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          client: string;
          service: string;
          date: string;
          time: string;
          duration: number;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client: string;
          service: string;
          date: string;
          time: string;
          duration: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client?: string;
          service?: string;
          date?: string;
          time?: string;
          duration?: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: Record<string, unknown>;
  };
}
