
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
      catering_orders: {
        Row: {
          id: string;
          client_name: string;
          event_date: string;
          number_of_people: number;
          menu_type: "standard" | "vegetarian" | "vegan" | "gluten_free" | "premium" | "custom";
          special_requirements: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          payment_method: string | null;
          payment_status: string | null;
          payment_details: Record<string, any> | null;
          dinner_group_id: string | null;
        };
        Insert: {
          id?: string;
          client_name: string;
          event_date: string;
          number_of_people: number;
          menu_type: "standard" | "vegetarian" | "vegan" | "gluten_free" | "premium" | "custom";
          special_requirements?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          payment_details?: Record<string, any> | null;
          dinner_group_id?: string | null;
        };
        Update: {
          id?: string;
          client_name?: string;
          event_date?: string;
          number_of_people?: number;
          menu_type?: "standard" | "vegetarian" | "vegan" | "gluten_free" | "premium" | "custom";
          special_requirements?: string | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          payment_method?: string | null;
          payment_status?: string | null;
          payment_details?: Record<string, any> | null;
          dinner_group_id?: string | null;
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
    Enums: {
      menu_type_enum: "standard" | "vegetarian" | "vegan" | "gluten_free" | "premium" | "custom";
    };
  };
}
