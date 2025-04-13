
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
  payment_method: PaymentMethod;
  payment_status: "pending" | "paid" | "cancelled" | "refunded";
  payment_details?: Record<string, any>;
  reference_number?: string;
}

export interface Guest {
  guest_id: string;
  guest_name: string;
  special_requirements: string | null;
  meal_time: string;
  menu_item_id: string | null;
  menu_variation_id: string | null;
}

export interface MenuItem {
  menu_id: string;
  menu_name: string;
  menu_category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  guests?: Guest[];
}

export type MenuType = "standard" | "vegetarian" | "vegan" | "gluten_free" | "premium" | "custom";
export type PaymentMethod = "mercado_pago" | "cash" | "transfer";
export type OrderStatus = "pending" | "approved" | "cancelled" | "refunded" | "draft";

export interface Order {
  id: string;
  client_name: string;
  event_date: string;
  status: OrderStatus;
  payment_status?: "pending" | "paid" | "cancelled" | "refunded";
  payment_method?: PaymentMethod;
  payment_id?: string | null;
  payment_details?: Record<string, any>;
  total_guests: number;
  total_amount: number;
  menus?: MenuItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
  dinner_group?: DinnerGroup;
  dinner_group_id?: string;
  payments?: Payment[];
  number_of_people?: number; // For backward compatibility
}
