
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de credenciales de Supabase
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error("⚠️ Las credenciales de Supabase no están configuradas. Usando modo local.");
}

// Crear el cliente de Supabase solo si las credenciales están disponibles
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Función auxiliar para verificar si Supabase está disponible
export const isSupabaseAvailable = () => {
  return isSupabaseConfigured && supabase !== null;
};
