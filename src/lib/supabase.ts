import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          key: string;
          name: string;
          created_at: string;
          created_by: string;
          pin: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          created_at?: string;
          created_by: string;
          pin: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          created_at?: string;
          created_by?: string;
          pin?: string;
        };
      };
      files: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          type: string;
          size: number;
          url: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          type: string;
          size: number;
          url: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          type?: string;
          size?: number;
          url?: string;
          uploaded_at?: string;
        };
      };
    };
  };
}