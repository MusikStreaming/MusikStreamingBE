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
          gender: Database["public"]["Enums"]["genders"] | null
          id: string
          name: string
        }
        Insert: {
          avatarurl?: string | null
          country?: string | null
          description?: string | null
          gender?: Database["public"]["Enums"]["genders"] | null
          id: string
          name: string
        }
        Update: {
          avatarurl?: string | null
          country?: string | null
          description?: string | null
          gender?: Database["public"]["Enums"]["genders"] | null
          id?: string
          name?: string
        }
        Relationships: []
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
      playlists: {
        Row: {
          description: string | null
          songid: string
          thumbnailurl: string | null
          title: string
          type: Database["public"]["Enums"]["playlist_type"]
          userid: string
        }
        Insert: {
          description?: string | null
          songid: string
          thumbnailurl?: string | null
          title: string
          type: Database["public"]["Enums"]["playlist_type"]
          userid: string
        }
        Update: {
          description?: string | null
          songid?: string
          thumbnailurl?: string | null
          title?: string
          type?: Database["public"]["Enums"]["playlist_type"]
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_songid_fkey"
            columns: ["songid"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatarurl: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          role: string | null
        }
        Insert: {
          avatarurl?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          role?: string | null
        }
        Update: {
          avatarurl?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          duration: number | null
          fileurl: string | null
          id: string
          releasedate: string | null
          thumbnailurl: string | null
          title: string
        }
        Insert: {
          duration?: number | null
          fileurl?: string | null
          id?: string
          releasedate?: string | null
          thumbnailurl?: string | null
          title: string
        }
        Update: {
          duration?: number | null
          fileurl?: string | null
          id?: string
          releasedate?: string | null
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
      gender_type: "M" | "F" | "NB"
      genders: "M" | "F" | "NB"
      playlist_type: "Album" | "Single" | "EP" | "Playlist"
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
