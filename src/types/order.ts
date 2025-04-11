
export interface DinnerGroup {
  id: string;
  requester_name: string;
  contact_email?: string;
  contact_phone?: string;
  company?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: "pending" | "paid" | "cancelled" | "refunded";
  payment_details?: Record<string, any>;
  reference_number?: string;
}

export interface Order {
  id: string;
  client_name: string;
  event_date: string;
  number_of_people: number;
  menu_type: string;
  special_requirements: string;
  status: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  payment_status?: "pending" | "paid" | "cancelled" | "refunded";
  payment_details?: Record<string, any>;
  dinner_group?: DinnerGroup;
  dinner_group_id?: string;
  payments?: Payment[];
}
