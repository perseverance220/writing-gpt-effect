import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Participant = {
  id: string;
  identifier: string;
  group_assignment: 'A' | 'B' | 'C';
  status: 'pending' | 'in_progress' | 'completed' | 'dropped';
  age_block?: string;
  started_at?: string;
  completed_at?: string;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
};
