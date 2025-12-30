import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type for a single room's data
export type RoomData = {
  winning_numbers: number[];
  machine_numbers: number[];
};

// Type for all rooms in a day (JSON structure)
export type RoomsData = Record<string, RoomData>;

// Type for database row (NEW SCHEMA)
export type LottoDrawRow = {
  id: string;
  created_at: string;
  updated_at: string;
  draw_date: string;
  rooms: RoomsData; // JSON object with all rooms
};
