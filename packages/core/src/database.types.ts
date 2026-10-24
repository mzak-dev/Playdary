export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_model_health: {
        Row: {
          cooldown_until: string
          model_id: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          cooldown_until: string
          model_id: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          cooldown_until?: string
          model_id?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          count: number
          day: string
          user_id: string
        }
        Insert: {
          count?: number
          day?: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          game_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_mutes: {
        Row: {
          friend_id: string
          user_id: string
        }
        Insert: {
          friend_id: string
          user_id: string
        }
        Update: {
          friend_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_mutes_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          data: Json
          details: Json | null
          embedding: string | null
          hypes: number | null
          id: number
          name: string
          rating_count: number | null
          release_date: number | null
          score: number | null
          updated_at: string
        }
        Insert: {
          data?: Json
          details?: Json | null
          embedding?: string | null
          hypes?: number | null
          id: number
          name: string
          rating_count?: number | null
          release_date?: number | null
          score?: number | null
          updated_at?: string
        }
        Update: {
          data?: Json
          details?: Json | null
          embedding?: string | null
          hypes?: number | null
          id?: number
          name?: string
          rating_count?: number | null
          release_date?: number | null
          score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      list_items: {
        Row: {
          created_at: string
          game_id: number
          list_id: string
          position: number
        }
        Insert: {
          created_at?: string
          game_id: number
          list_id: string
          position?: number
        }
        Update: {
          created_at?: string
          game_id?: number
          list_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_items_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          notifications: Json
          privacy: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          notifications?: Json
          privacy?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications?: Json
          privacy?: string
          username?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          game_id: number
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: number
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: number
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ai_consume: { Args: { p_limit: number; p_user: string }; Returns: number }
      ai_game_card: {
        Args: { g: Database["public"]["Tables"]["games"]["Row"] }
        Returns: Json
      }
      ai_my_lists: { Args: { args: Json }; Returns: Json }
      ai_refund: { Args: { p_user: string }; Returns: undefined }
      ai_search_games: { Args: { args: Json }; Returns: Json }
      ai_similar_games: { Args: { args: Json }; Returns: Json }
      ai_upcoming_releases: { Args: { args: Json }; Returns: Json }
      browse_games: {
        Args: {
          p_genres?: string[]
          p_hide_listed?: boolean
          p_limit?: number
          p_min_score?: number
          p_offset?: number
          p_period?: string
          p_platforms?: string[]
          p_sort?: string
          p_tab?: string
          p_themes?: string[]
        }
        Returns: {
          cover: string
          genres: string[]
          hypes: number
          id: number
          name: string
          platforms: string[]
          release_date: number
          score: number
          themes: string[]
          total: number
        }[]
      }
      can_view: { Args: { owner: string }; Returns: boolean }
      friend_activity: {
        Args: { p_limit?: number }
        Returns: {
          cover: string
          created_at: string
          friend_id: string
          game_id: number
          game_name: string
          kind: string
          score: number
          username: string
        }[]
      }
      friend_cards: {
        Args: never
        Returns: {
          done: number
          friend_id: string
          match: number
          muted: boolean
          playing_id: number
          playing_name: string
          rated: number
          since: string
          username: string
        }[]
      }
      friend_detail: { Args: { p_friend: string }; Returns: Json }
      friend_events: {
        Args: { p_limit: number; p_users: string[] }
        Returns: {
          cover: string
          created_at: string
          friend_id: string
          game_id: number
          game_name: string
          kind: string
          score: number
          username: string
        }[]
      }
      friend_requests: {
        Args: never
        Returns: {
          created_at: string
          direction: string
          mutual: number
          user_id: string
          username: string
        }[]
      }
      friends_on_game: {
        Args: { g: number }
        Returns: {
          kind: string
          score: number
          user_id: string
          username: string
        }[]
      }
      friends_on_games: {
        Args: { ids: number[] }
        Returns: {
          game_id: number
          kind: string
          score: number
          username: string
        }[]
      }
      mutual_friends: { Args: { other: string }; Returns: number }
      my_friend_ids: { Args: never; Returns: string[] }
      random_covers: { Args: { p_count?: number }; Returns: string[] }
      search_games: {
        Args: { lim?: number; q: string; q_embedding?: string }
        Returns: {
          data: Json
          id: number
          name: string
          score: number
        }[]
      }
      search_users: {
        Args: { q: string }
        Returns: {
          mutual: number
          relation: string
          user_id: string
          username: string
        }[]
      }
      similar_games: {
        Args: { p_game_id: number; p_limit?: number }
        Returns: {
          cover: string
          genres: string[]
          hypes: number
          id: number
          name: string
          platforms: string[]
          release_date: number
          score: number
          themes: string[]
        }[]
      }
      taste_match: { Args: { other: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
