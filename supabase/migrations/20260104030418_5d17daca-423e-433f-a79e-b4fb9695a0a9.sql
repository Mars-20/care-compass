-- =====================================================
-- MARKTOLOGY COMPLETE DATABASE SCHEMA
-- Healthcare Clinic & Patient Management Platform
-- =====================================================

-- Clinic Status Enum
CREATE TYPE public.clinic_status AS ENUM ('active', 'suspended', 'inactive');

-- Visit Status Enum
CREATE TYPE public.visit_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Appointment Status Enum
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Follow-up Status Enum
CREATE TYPE public.followup_status AS ENUM ('pending', 'completed', 'overdue', 'cancelled');

-- Audit Action Enum
CREATE TYPE public.audit_action AS ENUM ('create', 'read', 'update', 'delete');

-- =====================================================
-- CLINICS TABLE
-- =====================================================
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    registration_code TEXT UNIQUE NOT NULL,
    specialty TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status clinic_status DEFAULT 'active' NOT NULL,
    license_number TEXT,
    license_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- CLINIC STAFF (Link doctors to clinics)
-- =====================================================
CREATE TABLE public.clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'doctor',
    invitation_code TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (clinic_id, user_id)
);

-- =====================================================
-- REGISTRATION CODES
-- =====================================================
CREATE TABLE public.registration_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('clinic', 'doctor')),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    -- Personal Information
    medical_record_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    national_id TEXT,
    
    -- Contact Information
    phone TEXT NOT NULL,
    phone_secondary TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    
    -- Medical Information
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', NULL)),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    
    -- Insurance
    insurance_provider TEXT,
    insurance_number TEXT,
    insurance_expiry DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE (clinic_id, medical_record_number)
);

-- =====================================================
-- PATIENT MEDICAL HISTORY (Chronic conditions)
-- =====================================================
CREATE TABLE public.patient_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    condition_name TEXT NOT NULL,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('chronic', 'past', 'surgical', 'family')),
    diagnosis_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- PATIENT ALLERGIES
-- =====================================================
CREATE TABLE public.patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    allergen TEXT NOT NULL,
    allergy_type TEXT NOT NULL CHECK (allergy_type IN ('medication', 'food', 'environmental', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    reaction TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- PATIENT MEDICATIONS (Current medications)
-- =====================================================
CREATE TABLE public.patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    prescribed_by TEXT,
    is_current BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- VISITS TABLE (Main medical encounters)
-- =====================================================
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    visit_number TEXT NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    visit_type TEXT NOT NULL CHECK (visit_type IN ('new', 'follow_up', 'emergency', 'routine_checkup', 'consultation')),
    status visit_status DEFAULT 'scheduled' NOT NULL,
    
    -- Chief Complaint
    chief_complaint TEXT,
    
    -- Vitals
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature NUMERIC(4,1),
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    weight_kg NUMERIC(5,2),
    height_cm NUMERIC(5,2),
    
    -- Clinical Notes
    history_of_present_illness TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    
    -- Additional
    notes TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE (clinic_id, visit_number)
);

-- =====================================================
-- DIAGNOSES (ICD-10 based)
-- =====================================================
CREATE TABLE public.diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    
    diagnosis_code TEXT,
    diagnosis_name TEXT NOT NULL,
    diagnosis_type TEXT NOT NULL CHECK (diagnosis_type IN ('primary', 'secondary', 'differential')),
    notes TEXT,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- PRESCRIPTIONS
-- =====================================================
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    quantity INTEGER,
    instructions TEXT,
    refills INTEGER DEFAULT 0,
    
    prescribed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- LAB ORDERS
-- =====================================================
CREATE TABLE public.lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    
    test_name TEXT NOT NULL,
    test_code TEXT,
    urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'stat')),
    status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'collected', 'processing', 'completed', 'cancelled')),
    
    results TEXT,
    result_date TIMESTAMP WITH TIME ZONE,
    normal_range TEXT,
    notes TEXT,
    
    ordered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- FOLLOW-UPS
-- =====================================================
CREATE TABLE public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    
    follow_up_date DATE NOT NULL,
    reason TEXT NOT NULL,
    instructions TEXT,
    status followup_status DEFAULT 'pending' NOT NULL,
    
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    completed_visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    
    appointment_type TEXT NOT NULL CHECK (appointment_type IN ('new', 'follow_up', 'consultation', 'procedure', 'checkup')),
    status appointment_status DEFAULT 'pending' NOT NULL,
    
    reason TEXT,
    notes TEXT,
    
    reminder_sent BOOLEAN DEFAULT false,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- AUDIT LOG
-- =====================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    
    action audit_action NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    
    old_data JSONB,
    new_data JSONB,
    
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if user belongs to a clinic
CREATE OR REPLACE FUNCTION public.user_belongs_to_clinic(_user_id UUID, _clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.clinic_staff
        WHERE user_id = _user_id AND clinic_id = _clinic_id AND is_active = true
    ) OR EXISTS (
        SELECT 1 FROM public.clinics
        WHERE id = _clinic_id AND owner_id = _user_id
    )
$$;

-- Get user's clinic ID
CREATE OR REPLACE FUNCTION public.get_user_clinic_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT clinic_id FROM public.clinic_staff WHERE user_id = _user_id AND is_active = true LIMIT 1),
        (SELECT id FROM public.clinics WHERE owner_id = _user_id LIMIT 1)
    )
$$;

-- Generate unique registration code
CREATE OR REPLACE FUNCTION public.generate_registration_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Generate medical record number
CREATE OR REPLACE FUNCTION public.generate_medical_record_number(_clinic_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    prefix TEXT;
    seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(medical_record_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO seq
    FROM public.patients
    WHERE clinic_id = _clinic_id;
    
    RETURN 'MRN-' || LPAD(seq::TEXT, 6, '0');
END;
$$;

-- Generate visit number
CREATE OR REPLACE FUNCTION public.generate_visit_number(_clinic_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(visit_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO seq
    FROM public.visits
    WHERE clinic_id = _clinic_id;
    
    RETURN 'V-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$;

-- =====================================================
-- RLS POLICIES FOR CLINICS
-- =====================================================
CREATE POLICY "Admins can view all clinics"
ON public.clinics FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinic owners and staff can view their clinic"
ON public.clinics FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR public.user_belongs_to_clinic(auth.uid(), id));

CREATE POLICY "Admins can manage clinics"
ON public.clinics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can update their clinic"
ON public.clinics FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- =====================================================
-- RLS POLICIES FOR CLINIC STAFF
-- =====================================================
CREATE POLICY "Admins can manage all staff"
ON public.clinic_staff FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own staff record"
ON public.clinic_staff FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Clinic owners can manage staff"
ON public.clinic_staff FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);

-- =====================================================
-- RLS POLICIES FOR REGISTRATION CODES
-- =====================================================
CREATE POLICY "Admins can manage registration codes"
ON public.registration_codes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinic owners can manage their codes"
ON public.registration_codes FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);

-- =====================================================
-- RLS POLICIES FOR PATIENTS
-- =====================================================
CREATE POLICY "Admins can view all patients (read-only)"
ON public.patients FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinic staff can manage patients"
ON public.patients FOR ALL
TO authenticated
USING (public.user_belongs_to_clinic(auth.uid(), clinic_id));

-- =====================================================
-- RLS POLICIES FOR PATIENT MEDICAL DATA
-- =====================================================
CREATE POLICY "Clinic staff can manage patient medical history"
ON public.patient_medical_history FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND public.user_belongs_to_clinic(auth.uid(), p.clinic_id))
);

CREATE POLICY "Clinic staff can manage patient allergies"
ON public.patient_allergies FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND public.user_belongs_to_clinic(auth.uid(), p.clinic_id))
);

CREATE POLICY "Clinic staff can manage patient medications"
ON public.patient_medications FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND public.user_belongs_to_clinic(auth.uid(), p.clinic_id))
);

-- =====================================================
-- RLS POLICIES FOR VISITS
-- =====================================================
CREATE POLICY "Admins can view all visits (read-only)"
ON public.visits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinic staff can manage visits"
ON public.visits FOR ALL
TO authenticated
USING (public.user_belongs_to_clinic(auth.uid(), clinic_id));

-- =====================================================
-- RLS POLICIES FOR DIAGNOSES
-- =====================================================
CREATE POLICY "Clinic staff can manage diagnoses"
ON public.diagnoses FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.visits v WHERE v.id = visit_id AND public.user_belongs_to_clinic(auth.uid(), v.clinic_id))
);

-- =====================================================
-- RLS POLICIES FOR PRESCRIPTIONS
-- =====================================================
CREATE POLICY "Clinic staff can manage prescriptions"
ON public.prescriptions FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.visits v WHERE v.id = visit_id AND public.user_belongs_to_clinic(auth.uid(), v.clinic_id))
);

-- =====================================================
-- RLS POLICIES FOR LAB ORDERS
-- =====================================================
CREATE POLICY "Clinic staff can manage lab orders"
ON public.lab_orders FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.visits v WHERE v.id = visit_id AND public.user_belongs_to_clinic(auth.uid(), v.clinic_id))
);

-- =====================================================
-- RLS POLICIES FOR FOLLOW-UPS
-- =====================================================
CREATE POLICY "Clinic staff can manage follow-ups"
ON public.follow_ups FOR ALL
TO authenticated
USING (public.user_belongs_to_clinic(auth.uid(), clinic_id));

-- =====================================================
-- RLS POLICIES FOR APPOINTMENTS
-- =====================================================
CREATE POLICY "Clinic staff can manage appointments"
ON public.appointments FOR ALL
TO authenticated
USING (public.user_belongs_to_clinic(auth.uid(), clinic_id));

-- =====================================================
-- RLS POLICIES FOR AUDIT LOGS
-- =====================================================
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinic staff can view their clinic audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.user_belongs_to_clinic(auth.uid(), clinic_id));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_clinics_updated_at
    BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_orders_updated_at
    BEFORE UPDATE ON public.lab_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at
    BEFORE UPDATE ON public.follow_ups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- AUDIT LOG TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _clinic_id UUID;
    _action audit_action;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        _action := 'create';
    ELSIF TG_OP = 'UPDATE' THEN
        _action := 'update';
    ELSIF TG_OP = 'DELETE' THEN
        _action := 'delete';
    END IF;
    
    -- Try to get clinic_id from the record
    IF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'patients' OR TG_TABLE_NAME = 'visits' OR TG_TABLE_NAME = 'appointments' THEN
            _clinic_id := OLD.clinic_id;
        END IF;
    ELSE
        IF TG_TABLE_NAME = 'patients' OR TG_TABLE_NAME = 'visits' OR TG_TABLE_NAME = 'appointments' THEN
            _clinic_id := NEW.clinic_id;
        END IF;
    END IF;
    
    INSERT INTO public.audit_logs (user_id, clinic_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        auth.uid(),
        _clinic_id,
        _action,
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_patients
    AFTER INSERT OR UPDATE OR DELETE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_visits
    AFTER INSERT OR UPDATE OR DELETE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.log_audit();