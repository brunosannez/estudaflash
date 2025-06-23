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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage_tracking: {
        Row: {
          action_type: string
          api_provider: string
          created_at: string
          error_message: string | null
          estimated_cost_usd: number
          id: string
          model_used: string
          success: boolean
          timestamp: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          action_type: string
          api_provider: string
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number
          id?: string
          model_used: string
          success?: boolean
          timestamp?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          action_type?: string
          api_provider?: string
          created_at?: string
          error_message?: string | null
          estimated_cost_usd?: number
          id?: string
          model_used?: string
          success?: boolean
          timestamp?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
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
      guardians: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          relation_to_student: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          relation_to_student: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          relation_to_student?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_maps: {
        Row: {
          content: Json
          created_at: string
          id: string
          resumo_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          resumo_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          resumo_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_maps_resumo_id_fkey"
            columns: ["resumo_id"]
            isOneToOne: false
            referencedRelation: "resumos"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          flashcard_model: string
          flashcards_limit: number
          id: string
          is_active: boolean | null
          is_editable: boolean
          name: string
          price_brl: number
          price_brl_yearly: number
          quiz_model: string
          quizzes_limit: number
          summaries_limit: number
          summary_model: string
          updated_at: string
          uploads_limit: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          flashcard_model?: string
          flashcards_limit?: number
          id?: string
          is_active?: boolean | null
          is_editable?: boolean
          name: string
          price_brl?: number
          price_brl_yearly?: number
          quiz_model?: string
          quizzes_limit?: number
          summaries_limit?: number
          summary_model?: string
          updated_at?: string
          uploads_limit?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          flashcard_model?: string
          flashcards_limit?: number
          id?: string
          is_active?: boolean | null
          is_editable?: boolean
          name?: string
          price_brl?: number
          price_brl_yearly?: number
          quiz_model?: string
          quizzes_limit?: number
          summaries_limit?: number
          summary_model?: string
          updated_at?: string
          uploads_limit?: number
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answered_at: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          quiz_question_id: string
          resumo_id: string
          selected_answer: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          quiz_question_id: string
          resumo_id: string
          selected_answer?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          quiz_question_id?: string
          resumo_id?: string
          selected_answer?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
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
      quiz_sessions: {
        Row: {
          completion_time_seconds: number | null
          correct_answers: number
          created_at: string
          current_question_index: number | null
          id: string
          last_activity_at: string | null
          progress_percentage: number | null
          questions_data: Json
          quiz_title: string
          resumo_id: string
          started_at: string | null
          status: string | null
          total_questions: number
          user_id: string
        }
        Insert: {
          completion_time_seconds?: number | null
          correct_answers: number
          created_at?: string
          current_question_index?: number | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          questions_data: Json
          quiz_title: string
          resumo_id: string
          started_at?: string | null
          status?: string | null
          total_questions: number
          user_id: string
        }
        Update: {
          completion_time_seconds?: number | null
          correct_answers?: number
          created_at?: string
          current_question_index?: number | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          questions_data?: Json
          quiz_title?: string
          resumo_id?: string
          started_at?: string | null
          status?: string | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_resumo_id_fkey"
            columns: ["resumo_id"]
            isOneToOne: false
            referencedRelation: "resumos"
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
          custom_name: string | null
          data_criacao: string
          id: string
          resumo_gerado: string
          upload_id: string
        }
        Insert: {
          custom_name?: string | null
          data_criacao?: string
          id?: string
          resumo_gerado: string
          upload_id: string
        }
        Update: {
          custom_name?: string | null
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
      subscriptions: {
        Row: {
          amount_paid_brl: number
          created_at: string
          id: string
          payment_method: string | null
          plan_id: string
          renewal_date: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid_brl: number
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid_brl?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          plan_id?: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          arquivo_original_nome: string
          data_upload: string
          file_size: number | null
          id: string
          imagem_url: string
          texto_extraido: string | null
          user_id: string
        }
        Insert: {
          arquivo_original_nome: string
          data_upload?: string
          file_size?: number | null
          id?: string
          imagem_url: string
          texto_extraido?: string | null
          user_id: string
        }
        Update: {
          arquivo_original_nome?: string
          data_upload?: string
          file_size?: number | null
          id?: string
          imagem_url?: string
          texto_extraido?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          action_type: string
          credits_used: number
          id: string
          metadata: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action_type: string
          credits_used?: number
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action_type?: string
          credits_used?: number
          id?: string
          metadata?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          date_of_birth: string
          full_name: string
          id: string
          is_minor: boolean
          school_year: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          full_name: string
          id?: string
          is_minor?: boolean
          school_year?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          full_name?: string
          id?: string
          is_minor?: boolean
          school_year?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
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
      uso_usuarios: {
        Row: {
          created_at: string
          data_ultimo_reset: string
          flashcards_gerados: number
          id: string
          is_admin: boolean
          plan_id: string
          plano: string
          quizzes_realizados: number
          updated_at: string
          uploads_realizados: number
          user_id: string
        }
        Insert: {
          created_at?: string
          data_ultimo_reset?: string
          flashcards_gerados?: number
          id?: string
          is_admin?: boolean
          plan_id: string
          plano?: string
          quizzes_realizados?: number
          updated_at?: string
          uploads_realizados?: number
          user_id: string
        }
        Update: {
          created_at?: string
          data_ultimo_reset?: string
          flashcards_gerados?: number
          id?: string
          is_admin?: boolean
          plan_id?: string
          plano?: string
          quizzes_realizados?: number
          updated_at?: string
          uploads_realizados?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uso_usuarios_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_by_email: {
        Args: { admin_email: string }
        Returns: boolean
      }
      admin_change_user_plan: {
        Args: { target_user_id: string; new_plan: string }
        Returns: boolean
      }
      admin_change_user_plan_new: {
        Args: { target_user_id: string; new_plan_id: string }
        Returns: boolean
      }
      admin_create_plan: {
        Args: {
          plan_name: string
          plan_description?: string
          plan_price_brl?: number
          plan_price_brl_yearly?: number
          plan_uploads_limit?: number
          plan_summaries_limit?: number
          plan_flashcards_limit?: number
          plan_quizzes_limit?: number
          plan_quiz_model?: string
          plan_summary_model?: string
          plan_flashcard_model?: string
          plan_features?: string[]
          plan_is_active?: boolean
        }
        Returns: string
      }
      admin_delete_user_data: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_promote_user: {
        Args: { target_email: string }
        Returns: boolean
      }
      admin_reset_user_usage: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_toggle_user_status: {
        Args: { target_user_id: string; is_active: boolean }
        Returns: boolean
      }
      admin_update_plan: {
        Args:
          | {
              target_plan_id: string
              new_price_brl?: number
              new_price_brl_yearly?: number
              new_uploads_limit?: number
              new_summaries_limit?: number
              new_flashcards_limit?: number
              new_quizzes_limit?: number
              new_quiz_model?: string
              new_summary_model?: string
              new_flashcard_model?: string
              new_is_editable?: boolean
            }
          | {
              target_plan_id: string
              new_price_brl?: number
              new_price_brl_yearly?: number
              new_uploads_limit?: number
              new_summaries_limit?: number
              new_flashcards_limit?: number
              new_quizzes_limit?: number
              new_quiz_model?: string
              new_summary_model?: string
              new_flashcard_model?: string
              new_is_editable?: boolean
              new_features?: string[]
              new_description?: string
              new_is_active?: boolean
            }
        Returns: boolean
      }
      check_user_is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      check_username_available: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      cleanup_old_files: {
        Args: { days_threshold?: number }
        Returns: {
          deleted_files: number
          freed_storage_mb: number
        }[]
      }
      get_active_plans: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          price_brl: number
          price_brl_yearly: number
          uploads_limit: number
          summaries_limit: number
          flashcards_limit: number
          quizzes_limit: number
          quiz_model: string
          summary_model: string
          flashcard_model: string
          features: string[]
        }[]
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          total_storage_mb: number
          active_users_7_days: number
        }[]
      }
      get_all_users_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          plano: string
          created_at: string
          uploads_realizados: number
          flashcards_gerados: number
          quizzes_realizados: number
          is_admin: boolean
          storage_mb: number
        }[]
      }
      get_data_management_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_files: number
          total_storage_mb: number
          average_storage_per_user: number
          total_users: number
          files_older_than_30_days: number
          files_older_than_7_days: number
          active_users_30_days: number
          largest_file_size_mb: number
          storage_by_plan: Json
        }[]
      }
      get_enhanced_quiz_history: {
        Args: { target_user_id?: string }
        Returns: {
          session_id: string
          resumo_id: string
          resumo_titulo: string
          quiz_title: string
          status: string
          total_questions: number
          correct_answers: number
          progress_percentage: number
          created_at: string
          last_activity_at: string
          completion_time_seconds: number
          can_resume: boolean
        }[]
      }
      get_usage_analytics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          action_type: string
          usage_date: string
          total_actions: number
          unique_users: number
          total_credits: number
        }[]
      }
      get_user_plan_details: {
        Args: { user_uuid?: string }
        Returns: {
          plan_name: string
          uploads_limit: number
          summaries_limit: number
          flashcards_limit: number
          quizzes_limit: number
          quiz_model: string
          summary_model: string
          flashcard_model: string
        }[]
      }
      get_user_storage_usage: {
        Args: { user_uuid: string }
        Returns: {
          total_files: number
          total_size_bytes: number
          total_size_mb: number
        }[]
      }
      get_user_usage_summary: {
        Args: { target_user_id: string }
        Returns: {
          action_type: string
          current_month_usage: number
          current_month_credits: number
          all_time_usage: number
          all_time_credits: number
        }[]
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_usage: {
        Args: {
          target_user_id: string
          target_action_type: string
          target_credits_used?: number
          target_metadata?: Json
        }
        Returns: boolean
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
