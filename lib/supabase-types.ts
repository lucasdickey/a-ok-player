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
      podcast_feeds: {
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
        }
        Relationships: [
          {
            foreignKeyName: "podcast_feeds_user_id_fkey"
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
            referencedRelation: "podcast_feeds"
            referencedColumns: ["id"]
          }
        ]
      }
      user_episode_progress: {
        Row: {
          user_id: string
          episode_id: string
          position: number
          completed: boolean
          last_played_at: string
        }
        Insert: {
          user_id: string
          episode_id: string
          position: number
          completed?: boolean
          last_played_at?: string
        }
        Update: {
          user_id?: string
          episode_id?: string
          position?: number
          completed?: boolean
          last_played_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_episode_progress_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_episode_progress_episode_id_fkey"
            columns: ["episode_id"]
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_queue: {
        Row: {
          user_id: string
          episode_id: string
          position: number
          added_at: string
        }
        Insert: {
          user_id: string
          episode_id: string
          position: number
          added_at?: string
        }
        Update: {
          user_id?: string
          episode_id?: string
          position?: number
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_queue_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_queue_episode_id_fkey"
            columns: ["episode_id"]
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          user_id: string
          playback_speed: number
          auto_download: boolean
          wifi_only: boolean
          auto_delete: boolean
          dark_mode: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          playback_speed?: number
          auto_download?: boolean
          wifi_only?: boolean
          auto_delete?: boolean
          dark_mode?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          playback_speed?: number
          auto_download?: boolean
          wifi_only?: boolean
          auto_delete?: boolean
          dark_mode?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
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