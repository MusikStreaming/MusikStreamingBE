export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          avatarurl: string | null
          country: string | null
          description: string | null
          id: string
          managerid: string
          name: string
        }
        Insert: {
          avatarurl?: string | null
          country?: string | null
          description?: string | null
          id?: string
          managerid?: string
          name: string
        }
        Update: {
          avatarurl?: string | null
          country?: string | null
          description?: string | null
          id?: string
          managerid?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_managerid_fkey"
            columns: ["managerid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artistssongs: {
        Row: {
          artistid: string
          songid: string
        }
        Insert: {
          artistid: string
          songid: string
        }
        Update: {
          artistid?: string
          songid?: string
        }
        Relationships: [
          {
            foreignKeyName: "artistssongs_artistid_fkey"
            columns: ["artistid"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artistssongs_songid_fkey"
            columns: ["songid"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      likedsongs: {
        Row: {
          songid: string
          userid: string
        }
        Insert: {
          songid: string
          userid: string
        }
        Update: {
          songid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked songs_songid_fkey"
            columns: ["songid"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liked songs_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          thumbnailurl: string | null
          title: string
          type: Database["public"]["Enums"]["playlist_option"]
          userid: string
          visibility: Database["public"]["Enums"]["visibility_option"] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          thumbnailurl?: string | null
          title: string
          type: Database["public"]["Enums"]["playlist_option"]
          userid?: string
          visibility?: Database["public"]["Enums"]["visibility_option"] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          thumbnailurl?: string | null
          title?: string
          type?: Database["public"]["Enums"]["playlist_option"]
          userid?: string
          visibility?: Database["public"]["Enums"]["visibility_option"] | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlistssongs: {
        Row: {
          playlistid: string
          songid: string
        }
        Insert: {
          playlistid: string
          songid: string
        }
        Update: {
          playlistid?: string
          songid?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_songid_fkey"
            columns: ["songid"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlistssongs_playlistid_fkey"
            columns: ["playlistid"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatarurl: string | null
          country: string | null
          id: string
          role: Database["public"]["Enums"]["role_option"]
          username: string | null
        }
        Insert: {
          avatarurl?: string | null
          country?: string | null
          id: string
          role?: Database["public"]["Enums"]["role_option"]
          username?: string | null
        }
        Update: {
          avatarurl?: string | null
          country?: string | null
          id?: string
          role?: Database["public"]["Enums"]["role_option"]
          username?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          duration: number | null
          id: string
          releasedate: string
          thumbnailurl: string | null
          title: string
        }
        Insert: {
          duration?: number | null
          id?: string
          releasedate?: string
          thumbnailurl?: string | null
          title: string
        }
        Update: {
          duration?: number | null
          id?: string
          releasedate?: string
          thumbnailurl?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      playlist_option: "Album" | "Single" | "EP" | "Playlist" | "Mix"
      role_option: "User" | "Admin" | "Artist Manager"
      visibility_option: "Public" | "Private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
