// Database types for Marktology

export type AppRole = 'admin' | 'doctor';
export type ClinicStatus = 'active' | 'suspended' | 'inactive';
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';
export type AuditAction = 'create' | 'read' | 'update' | 'delete';
export type Gender = 'male' | 'female';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type VisitType = 'new' | 'follow_up' | 'emergency' | 'routine_checkup' | 'consultation';
export type AppointmentType = 'new' | 'follow_up' | 'consultation' | 'procedure' | 'checkup';
export type ConditionType = 'chronic' | 'past' | 'surgical' | 'family';
export type AllergyType = 'medication' | 'food' | 'environmental' | 'other';
export type AllergySeverity = 'mild' | 'moderate' | 'severe';
export type DiagnosisType = 'primary' | 'secondary' | 'differential';
export type LabUrgency = 'routine' | 'urgent' | 'stat';
export type LabStatus = 'ordered' | 'collected' | 'processing' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  name_en: string | null;
  registration_code: string;
  specialty: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  owner_id: string | null;
  status: ClinicStatus;
  license_number: string | null;
  license_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicStaff {
  id: string;
  clinic_id: string;
  user_id: string;
  role: AppRole;
  invitation_code: string | null;
  is_active: boolean;
  joined_at: string;
  created_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  medical_record_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  national_id: string | null;
  phone: string;
  phone_secondary: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  blood_type: BloodType | null;
  height_cm: number | null;
  weight_kg: number | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  insurance_expiry: string | null;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientMedicalHistory {
  id: string;
  patient_id: string;
  condition_name: string;
  condition_type: ConditionType;
  diagnosis_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface PatientAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  allergy_type: AllergyType;
  severity: AllergySeverity;
  reaction: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PatientMedication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  prescribed_by: string | null;
  is_current: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Visit {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  visit_number: string;
  visit_date: string;
  visit_type: VisitType;
  status: VisitStatus;
  chief_complaint: string | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  history_of_present_illness: string | null;
  physical_examination: string | null;
  assessment: string | null;
  plan: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  id: string;
  visit_id: string;
  patient_id: string;
  diagnosis_code: string | null;
  diagnosis_name: string;
  diagnosis_type: DiagnosisType;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Prescription {
  id: string;
  visit_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  quantity: number | null;
  instructions: string | null;
  refills: number;
  prescribed_by: string | null;
  created_at: string;
}

export interface LabOrder {
  id: string;
  visit_id: string;
  patient_id: string;
  test_name: string;
  test_code: string | null;
  urgency: LabUrgency;
  status: LabStatus;
  results: string | null;
  result_date: string | null;
  normal_range: string | null;
  notes: string | null;
  ordered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  visit_id: string;
  patient_id: string;
  clinic_id: string;
  follow_up_date: string;
  reason: string;
  instructions: string | null;
  status: FollowUpStatus;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  completed_visit_id: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  reminder_sent: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  clinic_id: string | null;
  action: AuditAction;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface RegistrationCode {
  id: string;
  code: string;
  type: 'clinic' | 'doctor';
  clinic_id: string | null;
  created_by: string | null;
  used_by: string | null;
  is_used: boolean;
  expires_at: string | null;
  created_at: string;
  used_at: string | null;
}
