export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      podcast_subscriptions: {
        Row: {
          created_at: string
          feed_url: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feed_url: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feed_url?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      queue_items: {
        Row: {
          added_at: string
          episode_id: string
          id: string
          position: number
          user_id: string
        }
        Insert: {
          added_at?: string
          episode_id: string
          id?: string
          position: number
          user_id: string
        }
        Update: {
          added_at?: string
          episode_id?: string
          id?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_episodes: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_episodes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      playback_states: {
        Row: {
          episode_id: string
          id: string
          last_position: number
          playback_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          episode_id: string
          id?: string
          last_position: number
          playback_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          episode_id?: string
          id?: string
          last_position?: number
          playback_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playback_states_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}