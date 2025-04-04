export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      playback_states: {
        Row: {
          id: string;
          user_id: string;
          episode_id: string;
          position: number;
          duration: number;
          is_completed: boolean;
          last_played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          episode_id: string;
          position: number;
          duration: number;
          is_completed?: boolean;
          last_played_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          episode_id?: string;
          position?: number;
          duration?: number;
          is_completed?: boolean;
          last_played_at?: string;
        };
      };
      // Add other tables as needed
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T];
