-- Fix function search path issues
ALTER FUNCTION public.generate_registration_code() SET search_path = public;
ALTER FUNCTION public.generate_medical_record_number(UUID) SET search_path = public;
ALTER FUNCTION public.generate_visit_number(UUID) SET search_path = public;
ALTER FUNCTION public.log_audit() SET search_path = public;