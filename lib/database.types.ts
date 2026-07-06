export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          accommodation_included: boolean
          accommodation_paid: boolean
          accommodation_provided: boolean
          category: string
          company: string | null
          contact_info: string | null
          country_code: string
          created_at: string
          description: string | null
          highlight_tier: string
          id: number
          is_top: boolean
          job_type: string
          location: string | null
          portal_code: string
          portal_domain: string
          salary: string
          topped_at: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accommodation_included?: boolean
          accommodation_paid?: boolean
          accommodation_provided?: boolean
          category: string
          company?: string | null
          contact_info?: string | null
          country_code: string
          created_at?: string
          description?: string | null
          highlight_tier?: string
          id?: never
          is_top?: boolean
          job_type: string
          location?: string | null
          portal_code?: string
          portal_domain?: string
          salary: string
          topped_at?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accommodation_included?: boolean
          accommodation_paid?: boolean
          accommodation_provided?: boolean
          category?: string
          company?: string | null
          contact_info?: string | null
          country_code?: string
          created_at?: string
          description?: string | null
          highlight_tier?: string
          id?: never
          is_top?: boolean
          job_type?: string
          location?: string | null
          portal_code?: string
          portal_domain?: string
          salary?: string
          topped_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          job_id: number | null
          portal_code: string
          status: string
          stripe_session_id: string | null
          tier: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          job_id?: number | null
          portal_code?: string
          status?: string
          stripe_session_id?: string | null
          tier: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          job_id?: number | null
          portal_code?: string
          status?: string
          stripe_session_id?: string | null
          tier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          image: string | null
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_api_rate_limit: {
        Args: {
          p_key: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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

