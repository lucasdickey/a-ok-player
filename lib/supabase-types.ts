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
          id: string
          user_id: string
          title: string | null
          description: string | null
          author: string | null
          image_url: string | null
          feed_url: string
          website_url: string | null
          last_checked_at: string | null
          created_at: string
          episode_count?: number | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          description?: string | null
          author?: string | null
          image_url?: string | null
          feed_url: string
          website_url?: string | null
          last_checked_at?: string | null
          created_at?: string
          episode_count?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          description?: string | null
          author?: string | null
          image_url?: string | null
          feed_url?: string
          website_url?: string | null
          last_checked_at?: string | null
          created_at?: string
          episode_count?: number | null
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
      episodes: {
        Row: {
          id: string
          feed_id: string
          guid: string
          title: string
          description: string | null
          published_date: string | null
          duration: number | null
          audio_url: string
          image_url: string | null
          is_played: boolean
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          guid: string
          title: string
          description?: string | null
          published_date?: string | null
          duration?: number | null
          audio_url: string
          image_url?: string | null
          is_played?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          feed_id?: string
          guid?: string
          title?: string
          description?: string | null
          published_date?: string | null
          duration?: number | null
          audio_url?: string
          image_url?: string | null
          is_played?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_feed_id_fkey"
            columns: ["feed_id"]
            referencedRelation: "podcast_subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      queue_items: {
        Row: {
          id: string
          user_id: string
          episode_id: string
          position: number
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          episode_id: string
          position: number
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          episode_id?: string
          position?: number
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_episode_id_fkey"
            columns: ["episode_id"]
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
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
          id: string
          user_id: string
          episode_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          episode_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          episode_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_episodes_episode_id_fkey"
            columns: ["episode_id"]
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
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
          id: string
          user_id: string
          episode_id: string
          last_position: number
          playback_rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          episode_id: string
          last_position: number
          playback_rate?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          episode_id?: string
          last_position?: number
          playback_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playback_states_episode_id_fkey"
            columns: ["episode_id"]
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
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