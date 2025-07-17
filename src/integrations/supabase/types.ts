export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client: string
          created_at: string | null
          date: string
          duration: number
          id: string
          notes: string | null
          service: string
          status: string | null
          time: string
          updated_at: string | null
        }
        Insert: {
          client: string
          created_at?: string | null
          date: string
          duration: number
          id?: string
          notes?: string | null
          service: string
          status?: string | null
          time: string
          updated_at?: string | null
        }
        Update: {
          client?: string
          created_at?: string | null
          date?: string
          duration?: number
          id?: string
          notes?: string | null
          service?: string
          status?: string | null
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          budgeted: number
          color: string | null
          created_at: string | null
          id: string
          name: string
          spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budgeted: number
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budgeted?: number
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          streak_count: number | null
          streak_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          streak_count?: number | null
          streak_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          streak_count?: number | null
          streak_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_streak_id_fkey"
            columns: ["streak_id"]
            isOneToOne: false
            referencedRelation: "streaks"
            referencedColumns: ["id"]
          },
        ]
      }
      catering_orders: {
        Row: {
          amount_paid: number | null
          business_id: string | null
          client_name: string
          created_at: string | null
          dinner_group_id: string | null
          event_date: string
          id: string
          notes: string | null
          order_status: string | null
          payment_details: Json | null
          payment_method: string | null
          payment_status: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          business_id?: string | null
          client_name: string
          created_at?: string | null
          dinner_group_id?: string | null
          event_date: string
          id?: string
          notes?: string | null
          order_status?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          business_id?: string | null
          client_name?: string
          created_at?: string | null
          dinner_group_id?: string | null
          event_date?: string
          id?: string
          notes?: string | null
          order_status?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catering_orders_dinner_group_id_fkey"
            columns: ["dinner_group_id"]
            isOneToOne: false
            referencedRelation: "dinner_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      dinner_groups: {
        Row: {
          company: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          notes: string | null
          requester_name: string
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          requester_name: string
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          requester_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          completed: boolean | null
          created_at: string | null
          goal_id: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          goal_id: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          goal_id?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_template_milestones: {
        Row: {
          created_at: string | null
          id: string
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_template_milestones_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      human_notifications: {
        Row: {
          assistant_id: string
          business_id: string
          created_at: string
          customer: Json
          id: string
          issue: string
          source: string | null
          status: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          business_id: string
          created_at?: string
          customer: Json
          id?: string
          issue: string
          source?: string | null
          status?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          business_id?: string
          created_at?: string
          customer?: Json
          id?: string
          issue?: string
          source?: string | null
          status?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string | null
          id: string
          initial_investment: number
          last_updated: string | null
          name: string
          return_percentage: number
          type: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          initial_investment: number
          last_updated?: string | null
          name: string
          return_percentage: number
          type: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          initial_investment?: number
          last_updated?: string | null
          name?: string
          return_percentage?: number
          type?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          menu_id: string
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          menu_id: string
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          menu_id?: string
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_variations: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          menu_item_id: string
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          menu_item_id: string
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          menu_item_id?: string
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_variations_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          business_id: string
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          menu_type: string | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          menu_type?: string | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          menu_type?: string | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_guests: {
        Row: {
          created_at: string
          guest_name: string
          id: string
          meal_date: string
          meal_time: string | null
          menu_id: string | null
          menu_item_id: string | null
          menu_variation_id: string | null
          order_id: string
          quantity: number | null
          special_requirements: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          id?: string
          meal_date: string
          meal_time?: string | null
          menu_id?: string | null
          menu_item_id?: string | null
          menu_variation_id?: string | null
          order_id: string
          quantity?: number | null
          special_requirements?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          id?: string
          meal_date?: string
          meal_time?: string | null
          menu_id?: string | null
          menu_item_id?: string | null
          menu_variation_id?: string | null
          order_id?: string
          quantity?: number | null
          special_requirements?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_guests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "catering_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          collector_id: number | null
          created_at: string | null
          currency_id: string | null
          id: string
          order_id: string | null
          payment_details: Json | null
          payment_link: string | null
          payment_method: string
          payment_status: string
          reference_id: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          collector_id?: number | null
          created_at?: string | null
          currency_id?: string | null
          id?: string
          order_id?: string | null
          payment_details?: Json | null
          payment_link?: string | null
          payment_method: string
          payment_status?: string
          reference_id?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          collector_id?: number | null
          created_at?: string | null
          currency_id?: string | null
          id?: string
          order_id?: string | null
          payment_details?: Json | null
          payment_link?: string | null
          payment_method?: string
          payment_status?: string
          reference_id?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "catering_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number
          icon: string | null
          id: string
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number
          icon?: string | null
          id?: string
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number
          icon?: string | null
          id?: string
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stats_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      streak_logs: {
        Row: {
          check_in_date: string | null
          created_at: string | null
          id: string
          notes: string | null
          streak_id: string | null
          user_id: string | null
        }
        Insert: {
          check_in_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          streak_id?: string | null
          user_id?: string | null
        }
        Update: {
          check_in_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          streak_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streak_logs_streak_id_fkey"
            columns: ["streak_id"]
            isOneToOne: false
            referencedRelation: "streaks"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          current_period_progress: number | null
          days: number | null
          description: string | null
          frequency_target: number | null
          frequency_type: string | null
          icon: string | null
          id: string
          name: string
          period_end_date: string | null
          period_start_date: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          current_period_progress?: number | null
          days?: number | null
          description?: string | null
          frequency_target?: number | null
          frequency_type?: string | null
          icon?: string | null
          id?: string
          name: string
          period_end_date?: string | null
          period_start_date?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          current_period_progress?: number | null
          days?: number | null
          description?: string | null
          frequency_target?: number | null
          frequency_type?: string | null
          icon?: string | null
          id?: string
          name?: string
          period_end_date?: string | null
          period_start_date?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string | null
          description: string
          id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string | null
          description: string
          id?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string | null
          description?: string
          id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          notification_settings: Json | null
          reminder_settings: Json | null
          theme_settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          reminder_settings?: Json | null
          theme_settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_settings?: Json | null
          reminder_settings?: Json | null
          theme_settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      menu_category_enum:
        | "appetizer"
        | "main_course"
        | "dessert"
        | "beverage"
        | "package"
        | "other"
      menu_dietary_enum:
        | "regular"
        | "vegetarian"
        | "vegan"
        | "kosher"
        | "halal"
        | "gluten_free"
        | "dairy_free"
        | "other"
      menu_type_enum:
        | "standard"
        | "vegetarian"
        | "vegan"
        | "gluten_free"
        | "premium"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      menu_category_enum: [
        "appetizer",
        "main_course",
        "dessert",
        "beverage",
        "package",
        "other",
      ],
      menu_dietary_enum: [
        "regular",
        "vegetarian",
        "vegan",
        "kosher",
        "halal",
        "gluten_free",
        "dairy_free",
        "other",
      ],
      menu_type_enum: [
        "standard",
        "vegetarian",
        "vegan",
        "gluten_free",
        "premium",
        "custom",
      ],
    },
  },
} as const
