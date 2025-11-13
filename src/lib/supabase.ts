import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      wards: {
        Row: {
          id: string;
          ward_number: string;
          ward_name_en: string;
          ward_name_hi: string;
          ward_name_kn: string;
          councillor_name: string;
          councillor_party: string;
          councillor_phone: string;
          city: string;
          created_at: string;
        };
      };
      problem_categories: {
        Row: {
          id: string;
          category_key: string;
          name_en: string;
          name_hi: string;
          name_kn: string;
          created_at: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          ward_id: string;
          category_id: string;
          citizen_name: string;
          citizen_phone: string;
          citizen_email: string | null;
          problem_description: string;
          image_url: string;
          location_details: string;
          status: string;
          verification_status: string;
          verification_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          ward_id: string;
          category_id: string;
          citizen_name: string;
          citizen_phone: string;
          citizen_email?: string;
          problem_description: string;
          image_url: string;
          location_details: string;
        };
      };
      complaint_updates: {
        Row: {
          id: string;
          complaint_id: string;
          update_text: string;
          updated_by: string;
          created_at: string;
        };
      };
    };
  };
};
