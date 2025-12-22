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
      users: {
        Row: {
          id: string
          email: string
          role: string
          organization_name: string | null
          full_name: string | null
          pin_hash: string
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          role: string
          organization_name?: string | null
          full_name?: string | null
          pin_hash: string
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: string
          organization_name?: string | null
          full_name?: string | null
          pin_hash?: string
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_active?: boolean
        }
      }
      tenders: {
        Row: {
          id: string
          title: string
          description: string
          scope_of_work: string
          technical_requirements: string
          functional_requirements: string
          eligibility_criteria: string
          submission_deadline: string
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          scope_of_work: string
          technical_requirements: string
          functional_requirements: string
          eligibility_criteria: string
          submission_deadline: string
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          scope_of_work?: string
          technical_requirements?: string
          functional_requirements?: string
          eligibility_criteria?: string
          submission_deadline?: string
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: string
          tender_id: string
          status: string
          relevance_score: number
          feasibility_score: number
          overall_score: number
          can_deliver: number
          partial_deliver: number
          out_of_scope: number
          gaps: string[]
          risks: string[]
          assumptions: string[]
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tender_id: string
          status?: string
          relevance_score?: number
          feasibility_score?: number
          overall_score?: number
          can_deliver?: number
          partial_deliver?: number
          out_of_scope?: number
          gaps?: string[]
          risks?: string[]
          assumptions?: string[]
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tender_id?: string
          status?: string
          relevance_score?: number
          feasibility_score?: number
          overall_score?: number
          can_deliver?: number
          partial_deliver?: number
          out_of_scope?: number
          gaps?: string[]
          risks?: string[]
          assumptions?: string[]
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          tender_id: string
          status: string
          executive_summary: string | null
          requirements_understanding: string | null
          technical_approach: string | null
          scope_coverage: string | null
          exclusions: string | null
          assumptions: string | null
          timeline: string | null
          commercial_details: string | null
          feedback: string | null
          submitted_at: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tender_id: string
          status?: string
          executive_summary?: string | null
          requirements_understanding?: string | null
          technical_approach?: string | null
          scope_coverage?: string | null
          exclusions?: string | null
          assumptions?: string | null
          timeline?: string | null
          commercial_details?: string | null
          feedback?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tender_id?: string
          status?: string
          executive_summary?: string | null
          requirements_understanding?: string | null
          technical_approach?: string | null
          scope_coverage?: string | null
          exclusions?: string | null
          assumptions?: string | null
          timeline?: string | null
          commercial_details?: string | null
          feedback?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          tender_id: string | null
          created_by: string
          target_roles: string[]
          read_by: string[]
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          tender_id?: string | null
          created_by: string
          target_roles: string[]
          read_by?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          tender_id?: string | null
          created_by?: string
          target_roles?: string[]
          read_by?: string[]
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          desktop_alerts: boolean
          weekly_reports: boolean
          sms_updates: boolean
          theme: string
          language: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          desktop_alerts?: boolean
          weekly_reports?: boolean
          sms_updates?: boolean
          theme?: string
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          desktop_alerts?: boolean
          weekly_reports?: boolean
          sms_updates?: boolean
          theme?: string
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      uploaded_files: {
        Row: {
          id: string
          tender_id: string | null
          file_name: string
          file_url: string
          file_size: number
          file_type: string | null
          uploaded_by: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          tender_id?: string | null
          file_name: string
          file_url: string
          file_size: number
          file_type?: string | null
          uploaded_by: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          tender_id?: string | null
          file_name?: string
          file_url?: string
          file_size?: number
          file_type?: string | null
          uploaded_by?: string
          uploaded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tenders_with_details: {
        Args: {
          user_role: string
          user_id_param: string | null
        }
        Returns: {
          tender_data: Json
        }[]
      }
      create_notification: {
        Args: {
          p_type: string
          p_title: string
          p_message: string
          p_tender_id: string
          p_created_by: string
          p_target_roles: string[]
        }
        Returns: string
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
          p_role: string
        }
        Returns: void
      }
      get_unread_count: {
        Args: {
          p_role: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

