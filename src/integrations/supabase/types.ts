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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          clinic_id: string
          created_at: string
          created_by: string | null
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          reminder_sent: boolean | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          clinic_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          clinic_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          clinic_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_staff: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          invitation_code: string | null
          is_active: boolean | null
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          invitation_code?: string | null
          is_active?: boolean | null
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          invitation_code?: string | null
          is_active?: boolean | null
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_staff_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          license_expiry: string | null
          license_number: string | null
          logo_url: string | null
          name: string
          name_en: string | null
          owner_id: string | null
          phone: string | null
          registration_code: string
          specialty: string
          status: Database["public"]["Enums"]["clinic_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          logo_url?: string | null
          name: string
          name_en?: string | null
          owner_id?: string | null
          phone?: string | null
          registration_code: string
          specialty: string
          status?: Database["public"]["Enums"]["clinic_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          logo_url?: string | null
          name?: string
          name_en?: string | null
          owner_id?: string | null
          phone?: string | null
          registration_code?: string
          specialty?: string
          status?: Database["public"]["Enums"]["clinic_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      diagnoses: {
        Row: {
          created_at: string
          created_by: string | null
          diagnosis_code: string | null
          diagnosis_name: string
          diagnosis_type: string
          id: string
          notes: string | null
          patient_id: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          diagnosis_code?: string | null
          diagnosis_name: string
          diagnosis_type: string
          id?: string
          notes?: string | null
          patient_id: string
          visit_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          diagnosis_code?: string | null
          diagnosis_name?: string
          diagnosis_type?: string
          id?: string
          notes?: string | null
          patient_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          clinic_id: string
          completed_at: string | null
          completed_visit_id: string | null
          created_at: string
          created_by: string | null
          follow_up_date: string
          id: string
          instructions: string | null
          notes: string | null
          patient_id: string
          reason: string
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          status: Database["public"]["Enums"]["followup_status"]
          updated_at: string
          visit_id: string
        }
        Insert: {
          clinic_id: string
          completed_at?: string | null
          completed_visit_id?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_date: string
          id?: string
          instructions?: string | null
          notes?: string | null
          patient_id: string
          reason: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          status?: Database["public"]["Enums"]["followup_status"]
          updated_at?: string
          visit_id: string
        }
        Update: {
          clinic_id?: string
          completed_at?: string | null
          completed_visit_id?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_date?: string
          id?: string
          instructions?: string | null
          notes?: string | null
          patient_id?: string
          reason?: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          status?: Database["public"]["Enums"]["followup_status"]
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_completed_visit_id_fkey"
            columns: ["completed_visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          created_at: string
          id: string
          normal_range: string | null
          notes: string | null
          ordered_by: string | null
          patient_id: string
          result_date: string | null
          results: string | null
          status: string | null
          test_code: string | null
          test_name: string
          updated_at: string
          urgency: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          normal_range?: string | null
          notes?: string | null
          ordered_by?: string | null
          patient_id: string
          result_date?: string | null
          results?: string | null
          status?: string | null
          test_code?: string | null
          test_name: string
          updated_at?: string
          urgency?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          normal_range?: string | null
          notes?: string | null
          ordered_by?: string | null
          patient_id?: string
          result_date?: string | null
          results?: string | null
          status?: string | null
          test_code?: string | null
          test_name?: string
          updated_at?: string
          urgency?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_allergies: {
        Row: {
          allergen: string
          allergy_type: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          patient_id: string
          reaction: string | null
          severity: string
        }
        Insert: {
          allergen: string
          allergy_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          reaction?: string | null
          severity: string
        }
        Update: {
          allergen?: string
          allergy_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          reaction?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_history: {
        Row: {
          condition_name: string
          condition_type: string
          created_at: string
          created_by: string | null
          diagnosis_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          patient_id: string
        }
        Insert: {
          condition_name: string
          condition_type: string
          created_at?: string
          created_by?: string | null
          diagnosis_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
        }
        Update: {
          condition_name?: string
          condition_type?: string
          created_at?: string
          created_by?: string | null
          diagnosis_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medications: {
        Row: {
          created_at: string
          created_by: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_current: boolean | null
          medication_name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          start_date: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_current?: boolean | null
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          start_date?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_current?: boolean | null
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          blood_type: string | null
          city: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          date_of_birth: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          first_name: string
          gender: string
          height_cm: number | null
          id: string
          insurance_expiry: string | null
          insurance_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string
          medical_record_number: string
          national_id: string | null
          notes: string | null
          phone: string
          phone_secondary: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          city?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name: string
          gender: string
          height_cm?: number | null
          id?: string
          insurance_expiry?: string | null
          insurance_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name: string
          medical_record_number: string
          national_id?: string | null
          notes?: string | null
          phone: string
          phone_secondary?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          city?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name?: string
          gender?: string
          height_cm?: number | null
          id?: string
          insurance_expiry?: string | null
          insurance_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string
          medical_record_number?: string
          national_id?: string | null
          notes?: string | null
          phone?: string
          phone_secondary?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          dosage: string
          duration: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string
          prescribed_by: string | null
          quantity: number | null
          refills: number | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          duration?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id: string
          prescribed_by?: string | null
          quantity?: number | null
          refills?: number | null
          visit_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          duration?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string
          prescribed_by?: string | null
          quantity?: number | null
          refills?: number | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      registration_codes: {
        Row: {
          clinic_id: string | null
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          type: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          clinic_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          type: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          clinic_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          type?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_codes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          assessment: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          chief_complaint: string | null
          clinic_id: string
          completed_at: string | null
          created_at: string
          doctor_id: string | null
          heart_rate: number | null
          height_cm: number | null
          history_of_present_illness: string | null
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_id: string
          physical_examination: string | null
          plan: string | null
          respiratory_rate: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["visit_status"]
          temperature: number | null
          updated_at: string
          visit_date: string
          visit_number: string
          visit_type: string
          weight_kg: number | null
        }
        Insert: {
          assessment?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          chief_complaint?: string | null
          clinic_id: string
          completed_at?: string | null
          created_at?: string
          doctor_id?: string | null
          heart_rate?: number | null
          height_cm?: number | null
          history_of_present_illness?: string | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          physical_examination?: string | null
          plan?: string | null
          respiratory_rate?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          temperature?: number | null
          updated_at?: string
          visit_date?: string
          visit_number: string
          visit_type: string
          weight_kg?: number | null
        }
        Update: {
          assessment?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          chief_complaint?: string | null
          clinic_id?: string
          completed_at?: string | null
          created_at?: string
          doctor_id?: string | null
          heart_rate?: number | null
          height_cm?: number | null
          history_of_present_illness?: string | null
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          physical_examination?: string | null
          plan?: string | null
          respiratory_rate?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          temperature?: number | null
          updated_at?: string
          visit_date?: string
          visit_number?: string
          visit_type?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_medical_record_number: {
        Args: { _clinic_id: string }
        Returns: string
      }
      generate_registration_code: { Args: never; Returns: string }
      generate_visit_number: { Args: { _clinic_id: string }; Returns: string }
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_clinic: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "doctor"
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      audit_action: "create" | "read" | "update" | "delete"
      clinic_status: "active" | "suspended" | "inactive"
      followup_status: "pending" | "completed" | "overdue" | "cancelled"
      visit_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
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
    Enums: {
      app_role: ["admin", "doctor"],
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      audit_action: ["create", "read", "update", "delete"],
      clinic_status: ["active", "suspended", "inactive"],
      followup_status: ["pending", "completed", "overdue", "cancelled"],
      visit_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
    },
  },
} as const
