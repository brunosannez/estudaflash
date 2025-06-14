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
      daily_activities: {
        Row: {
          activity_date: string
          created_at: string
          flashcards_reviewed: number
          id: string
          quiz_correct_answers: number
          quizzes_completed: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date?: string
          created_at?: string
          flashcards_reviewed?: number
          id?: string
          quiz_correct_answers?: number
          quizzes_completed?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          created_at?: string
          flashcards_reviewed?: number
          id?: string
          quiz_correct_answers?: number
          quizzes_completed?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          data_review: string
          flashcard_id: string
          id: string
          lembrou: boolean
          user_id: string
        }
        Insert: {
          data_review?: string
          flashcard_id: string
          id?: string
          lembrou: boolean
          user_id: string
        }
        Update: {
          data_review?: string
          flashcard_id?: string
          id?: string
          lembrou?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          data_criacao: string
          exemplo: string | null
          id: string
          pergunta: string
          resposta: string
          resumo_id: string
        }
        Insert: {
          data_criacao?: string
          exemplo?: string | null
          id?: string
          pergunta: string
          resposta: string
          resumo_id: string
        }
        Update: {
          data_criacao?: string
          exemplo?: string | null
          id?: string
          pergunta?: string
          resposta?: string
          resumo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_resumo_id_fkey"
            columns: ["resumo_id"]
            isOneToOne: false
            referencedRelation: "resumos"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_respostas: {
        Row: {
          acertou: boolean
          data_resposta: string
          id: string
          quiz_id: string
          resposta_selecionada: number
          user_id: string
        }
        Insert: {
          acertou: boolean
          data_resposta?: string
          id?: string
          quiz_id: string
          resposta_selecionada: number
          user_id: string
        }
        Update: {
          acertou?: boolean
          data_resposta?: string
          id?: string
          quiz_id?: string
          resposta_selecionada?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_respostas_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          alternativas: Json
          correta: number
          data_criacao: string
          explicacao: string
          id: string
          pergunta: string
          resumo_id: string
        }
        Insert: {
          alternativas: Json
          correta: number
          data_criacao?: string
          explicacao: string
          id?: string
          pergunta: string
          resumo_id: string
        }
        Update: {
          alternativas?: Json
          correta?: number
          data_criacao?: string
          explicacao?: string
          id?: string
          pergunta?: string
          resumo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_resumo_id_fkey"
            columns: ["resumo_id"]
            isOneToOne: false
            referencedRelation: "resumos"
            referencedColumns: ["id"]
          },
        ]
      }
      resumos: {
        Row: {
          data_criacao: string
          id: string
          resumo_gerado: string
          upload_id: string
        }
        Insert: {
          data_criacao?: string
          id?: string
          resumo_gerado: string
          upload_id: string
        }
        Update: {
          data_criacao?: string
          id?: string
          resumo_gerado?: string
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumos_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          arquivo_original_nome: string
          data_upload: string
          id: string
          imagem_url: string
          texto_extraido: string | null
          user_id: string
        }
        Insert: {
          arquivo_original_nome: string
          data_upload?: string
          id?: string
          imagem_url: string
          texto_extraido?: string | null
          user_id: string
        }
        Update: {
          arquivo_original_nome?: string
          data_upload?: string
          id?: string
          imagem_url?: string
          texto_extraido?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
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

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
