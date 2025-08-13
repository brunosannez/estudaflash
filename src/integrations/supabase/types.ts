export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
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
      challenge_participations: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          badge_reward: string | null
          category: string
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          target_value: number
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          badge_reward?: string | null
          category: string
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          target_value: number
          title: string
          type: string
          xp_reward?: number
        }
        Update: {
          badge_reward?: string | null
          category?: string
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value?: number
          title?: string
          type?: string
          xp_reward?: number
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
      enhanced_flashcard_reviews: {
        Row: {
          confidence_level: number | null
          created_at: string
          flashcard_id: string
          id: string
          new_ef_factor: number | null
          new_repetition_count: number | null
          next_review_date: string | null
          previous_ef_factor: number | null
          previous_repetition_count: number | null
          previous_review_date: string | null
          response_time_ms: number
          review_quality: number
          study_context: Json | null
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          flashcard_id: string
          id?: string
          new_ef_factor?: number | null
          new_repetition_count?: number | null
          next_review_date?: string | null
          previous_ef_factor?: number | null
          previous_repetition_count?: number | null
          previous_review_date?: string | null
          response_time_ms?: number
          review_quality: number
          study_context?: Json | null
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          flashcard_id?: string
          id?: string
          new_ef_factor?: number | null
          new_repetition_count?: number | null
          next_review_date?: string | null
          previous_ef_factor?: number | null
          previous_repetition_count?: number | null
          previous_review_date?: string | null
          response_time_ms?: number
          review_quality?: number
          study_context?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      file_processing_queue: {
        Row: {
          created_at: string
          error_message: string | null
          extracted_text: string | null
          file_path: string
          file_type: string
          id: string
          metadata: Json | null
          processing_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_path: string
          file_type: string
          id?: string
          metadata?: Json | null
          processing_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          extracted_text?: string | null
          file_path?: string
          file_type?: string
          id?: string
          metadata?: Json | null
          processing_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          data_review: string
          difficulty_rating: number | null
          flashcard_id: string
          id: string
          lembrou: boolean
          notes: string | null
          response_time_ms: number | null
          review_quality: number | null
          user_id: string
        }
        Insert: {
          data_review?: string
          difficulty_rating?: number | null
          flashcard_id: string
          id?: string
          lembrou: boolean
          notes?: string | null
          response_time_ms?: number | null
          review_quality?: number | null
          user_id: string
        }
        Update: {
          data_review?: string
          difficulty_rating?: number | null
          flashcard_id?: string
          id?: string
          lembrou?: boolean
          notes?: string | null
          response_time_ms?: number | null
          review_quality?: number | null
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
      flashcard_sessions: {
        Row: {
          completed_cards: Json
          created_at: string
          current_card_index: number
          id: string
          last_activity_at: string
          resumo_id: string
          session_stats: Json
          status: string
          user_id: string
        }
        Insert: {
          completed_cards?: Json
          created_at?: string
          current_card_index?: number
          id?: string
          last_activity_at?: string
          resumo_id: string
          session_stats?: Json
          status?: string
          user_id: string
        }
        Update: {
          completed_cards?: Json
          created_at?: string
          current_card_index?: number
          id?: string
          last_activity_at?: string
          resumo_id?: string
          session_stats?: Json
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_sessions_resumo_id_fkey"
            columns: ["resumo_id"]
            isOneToOne: false
            referencedRelation: "resumos"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_study_goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          current_progress: number
          end_date: string | null
          goal_type: string
          id: string
          is_active: boolean
          start_date: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          end_date?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          end_date?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_study_stats: {
        Row: {
          average_response_time_ms: number
          cards_remembered: number
          cards_reviewed: number
          category: string | null
          created_at: string
          id: string
          streak_count: number
          study_date: string
          total_study_time_minutes: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          average_response_time_ms?: number
          cards_remembered?: number
          cards_reviewed?: number
          category?: string | null
          created_at?: string
          id?: string
          streak_count?: number
          study_date?: string
          total_study_time_minutes?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          average_response_time_ms?: number
          cards_remembered?: number
          cards_reviewed?: number
          category?: string | null
          created_at?: string
          id?: string
          streak_count?: number
          study_date?: string
          total_study_time_minutes?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          category: string | null
          data_criacao: string
          difficulty: number
          ef_factor: number
          exemplo: string | null
          id: string
          is_favorite: boolean
          last_reviewed_at: string | null
          next_review_date: string | null
          pergunta: string
          repetition_count: number
          resposta: string
          resumo_id: string
          tags: string[] | null
        }
        Insert: {
          category?: string | null
          data_criacao?: string
          difficulty?: number
          ef_factor?: number
          exemplo?: string | null
          id?: string
          is_favorite?: boolean
          last_reviewed_at?: string | null
          next_review_date?: string | null
          pergunta: string
          repetition_count?: number
          resposta: string
          resumo_id: string
          tags?: string[] | null
        }
        Update: {
          category?: string | null
          data_criacao?: string
          difficulty?: number
          ef_factor?: number
          exemplo?: string | null
          id?: string
          is_favorite?: boolean
          last_reviewed_at?: string | null
          next_review_date?: string | null
          pergunta?: string
          repetition_count?: number
          resposta?: string
          resumo_id?: string
          tags?: string[] | null
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
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      guardian_access_audit: {
        Row: {
          accessed_at: string
          accessed_fields: string[]
          accessor_user_id: string
          id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          accessed_at?: string
          accessed_fields?: string[]
          accessor_user_id: string
          id?: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          accessed_at?: string
          accessed_fields?: string[]
          accessor_user_id?: string
          id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      guardian_encryption_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_text: string
          key_version: number
          rotated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_text: string
          key_version: number
          rotated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_text?: string
          key_version?: number
          rotated_at?: string | null
        }
        Relationships: []
      }
      guardians: {
        Row: {
          cpf: string | null
          cpf_encrypted: string | null
          cpf_key_version: number | null
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
          cpf_encrypted?: string | null
          cpf_key_version?: number | null
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
          cpf_encrypted?: string | null
          cpf_key_version?: number | null
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
      leaderboards: {
        Row: {
          category: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          rank_position: number
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type: string
          rank_position?: number
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          rank_position?: number
          updated_at?: string
          user_id?: string
          value?: number
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
          confidence_level: number | null
          created_at: string | null
          difficulty_perceived: number | null
          explanation_viewed: boolean | null
          hint_used: boolean | null
          id: string
          is_correct: boolean | null
          quiz_question_id: string
          resumo_id: string
          selected_answer: number | null
          session_id: string
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          confidence_level?: number | null
          created_at?: string | null
          difficulty_perceived?: number | null
          explanation_viewed?: boolean | null
          hint_used?: boolean | null
          id?: string
          is_correct?: boolean | null
          quiz_question_id: string
          resumo_id: string
          selected_answer?: number | null
          session_id: string
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          confidence_level?: number | null
          created_at?: string | null
          difficulty_perceived?: number | null
          explanation_viewed?: boolean | null
          hint_used?: boolean | null
          id?: string
          is_correct?: boolean | null
          quiz_question_id?: string
          resumo_id?: string
          selected_answer?: number | null
          session_id?: string
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_badges: {
        Row: {
          badge_description: string
          badge_icon: string | null
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description: string
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_configurations: {
        Row: {
          allow_hints: boolean | null
          category_filters: string[] | null
          created_at: string
          description: string | null
          difficulty_level: number | null
          id: string
          name: string
          questions_count: number | null
          randomize_answers: boolean | null
          randomize_questions: boolean | null
          show_explanations: boolean | null
          time_limit_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_hints?: boolean | null
          category_filters?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          name: string
          questions_count?: number | null
          randomize_answers?: boolean | null
          randomize_questions?: boolean | null
          show_explanations?: boolean | null
          time_limit_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_hints?: boolean | null
          category_filters?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          name?: string
          questions_count?: number | null
          randomize_answers?: boolean | null
          randomize_questions?: boolean | null
          show_explanations?: boolean | null
          time_limit_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_performance_stats: {
        Row: {
          average_accuracy: number | null
          average_time_per_question: number | null
          created_at: string
          current_streak: number | null
          date: string
          fastest_completion_time: number | null
          id: string
          longest_streak: number | null
          topics_mastered: string[] | null
          topics_struggling: string[] | null
          total_correct_answers: number | null
          total_questions_answered: number | null
          total_quizzes_attempted: number | null
          total_quizzes_completed: number | null
          updated_at: string
          user_id: string
          xp_earned_from_quizzes: number | null
        }
        Insert: {
          average_accuracy?: number | null
          average_time_per_question?: number | null
          created_at?: string
          current_streak?: number | null
          date?: string
          fastest_completion_time?: number | null
          id?: string
          longest_streak?: number | null
          topics_mastered?: string[] | null
          topics_struggling?: string[] | null
          total_correct_answers?: number | null
          total_questions_answered?: number | null
          total_quizzes_attempted?: number | null
          total_quizzes_completed?: number | null
          updated_at?: string
          user_id: string
          xp_earned_from_quizzes?: number | null
        }
        Update: {
          average_accuracy?: number | null
          average_time_per_question?: number | null
          created_at?: string
          current_streak?: number | null
          date?: string
          fastest_completion_time?: number | null
          id?: string
          longest_streak?: number | null
          topics_mastered?: string[] | null
          topics_struggling?: string[] | null
          total_correct_answers?: number | null
          total_questions_answered?: number | null
          total_quizzes_attempted?: number | null
          total_quizzes_completed?: number | null
          updated_at?: string
          user_id?: string
          xp_earned_from_quizzes?: number | null
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
          difficulty_level: number | null
          hints_used: number | null
          id: string
          last_activity_at: string | null
          performance_score: number | null
          progress_percentage: number | null
          questions_data: Json
          quiz_title: string
          resumo_id: string
          session_type: string | null
          started_at: string | null
          status: string | null
          study_recommendations: Json | null
          tags: string[] | null
          time_per_question_seconds: number | null
          total_questions: number
          user_id: string
          weak_topics: Json | null
        }
        Insert: {
          completion_time_seconds?: number | null
          correct_answers: number
          created_at?: string
          current_question_index?: number | null
          difficulty_level?: number | null
          hints_used?: number | null
          id?: string
          last_activity_at?: string | null
          performance_score?: number | null
          progress_percentage?: number | null
          questions_data: Json
          quiz_title: string
          resumo_id: string
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          study_recommendations?: Json | null
          tags?: string[] | null
          time_per_question_seconds?: number | null
          total_questions: number
          user_id: string
          weak_topics?: Json | null
        }
        Update: {
          completion_time_seconds?: number | null
          correct_answers?: number
          created_at?: string
          current_question_index?: number | null
          difficulty_level?: number | null
          hints_used?: number | null
          id?: string
          last_activity_at?: string | null
          performance_score?: number | null
          progress_percentage?: number | null
          questions_data?: Json
          quiz_title?: string
          resumo_id?: string
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          study_recommendations?: Json | null
          tags?: string[] | null
          time_per_question_seconds?: number | null
          total_questions?: number
          user_id?: string
          weak_topics?: Json | null
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
          tipo: string | null
        }
        Insert: {
          alternativas: Json
          correta: number
          data_criacao?: string
          explicacao: string
          id?: string
          pergunta: string
          resumo_id: string
          tipo?: string | null
        }
        Update: {
          alternativas?: Json
          correta?: number
          data_criacao?: string
          explicacao?: string
          id?: string
          pergunta?: string
          resumo_id?: string
          tipo?: string | null
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
      social_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          metadata: Json
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      study_analytics: {
        Row: {
          created_at: string
          date: string
          flashcards_mastered: number
          id: string
          learning_velocity: number | null
          quiz_accuracy_percentage: number | null
          retention_rate: number | null
          strong_topics: Json | null
          subject_area: string | null
          total_study_time_minutes: number
          updated_at: string
          user_id: string
          weak_topics: Json | null
        }
        Insert: {
          created_at?: string
          date?: string
          flashcards_mastered?: number
          id?: string
          learning_velocity?: number | null
          quiz_accuracy_percentage?: number | null
          retention_rate?: number | null
          strong_topics?: Json | null
          subject_area?: string | null
          total_study_time_minutes?: number
          updated_at?: string
          user_id: string
          weak_topics?: Json | null
        }
        Update: {
          created_at?: string
          date?: string
          flashcards_mastered?: number
          id?: string
          learning_velocity?: number | null
          quiz_accuracy_percentage?: number | null
          retention_rate?: number | null
          strong_topics?: Json | null
          subject_area?: string | null
          total_study_time_minutes?: number
          updated_at?: string
          user_id?: string
          weak_topics?: Json | null
        }
        Relationships: []
      }
      study_objectives: {
        Row: {
          completed_at: string | null
          created_at: string
          current_progress: number
          description: string | null
          difficulty_level: number | null
          end_date: string | null
          id: string
          is_active: boolean
          objective_type: string
          reward_xp: number | null
          start_date: string
          streak_bonus_multiplier: number | null
          subject_area: string | null
          target_metric: string
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          objective_type: string
          reward_xp?: number | null
          start_date?: string
          streak_bonus_multiplier?: number | null
          subject_area?: string | null
          target_metric: string
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          objective_type?: string
          reward_xp?: number | null
          start_date?: string
          streak_bonus_multiplier?: number | null
          subject_area?: string | null
          target_metric?: string
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_social_profiles: {
        Row: {
          avatar_url: string | null
          badges: Json
          bio: string | null
          created_at: string
          current_level: number
          display_name: string
          id: string
          is_public: boolean
          stats: Json
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json
          bio?: string | null
          created_at?: string
          current_level?: number
          display_name: string
          id?: string
          is_public?: boolean
          stats?: Json
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          badges?: Json
          bio?: string | null
          created_at?: string
          current_level?: number
          display_name?: string
          id?: string
          is_public?: boolean
          stats?: Json
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
      analyze_quiz_weak_topics: {
        Args: { user_uuid: string; last_sessions_count?: number }
        Returns: {
          topic: string
          total_questions: number
          correct_answers: number
          accuracy_percentage: number
          recommendation: string
        }[]
      }
      calculate_enhanced_spaced_repetition: {
        Args: {
          current_ef_factor: number
          repetition_count: number
          quality: number
          response_time_ms?: number
          confidence_level?: number
        }
        Returns: {
          next_date: string
          new_ef_factor: number
          new_repetition_count: number
          difficulty_adjustment: number
        }[]
      }
      calculate_next_review_date: {
        Args: {
          current_ef_factor: number
          repetition_count: number
          quality: number
        }
        Returns: {
          next_date: string
          new_ef_factor: number
          new_repetition_count: number
        }[]
      }
      calculate_quiz_performance_score: {
        Args: {
          correct_answers: number
          total_questions: number
          completion_time_seconds: number
          hints_used: number
          difficulty_level?: number
        }
        Returns: number
      }
      check_and_award_quiz_badges: {
        Args: { target_user_id: string }
        Returns: number
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
      get_active_guardian_key_version: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      get_cpf_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      get_flashcards_due_for_review: {
        Args: { target_user_id: string }
        Returns: {
          flashcard_id: string
          pergunta: string
          resposta: string
          exemplo: string
          category: string
          difficulty: number
          next_review_date: string
          days_overdue: number
        }[]
      }
      get_guardian_by_user: {
        Args:
          | { target_user_id: string }
          | { target_user_id: string; access_reason?: string }
        Returns: {
          full_name: string
          email: string
          phone: string
          cpf: string
          relation_to_student: string
        }[]
      }
      get_study_recommendations: {
        Args: { target_user_id: string }
        Returns: {
          recommendation_type: string
          title: string
          description: string
          priority: number
          estimated_time_minutes: number
          target_cards: number
          subject_area: string
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
      rotate_guardian_cpf_key: {
        Args: { new_key: string; new_key_version?: number }
        Returns: boolean
      }
      update_daily_quiz_stats: {
        Args: { target_user_id: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
