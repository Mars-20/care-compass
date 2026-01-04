import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Clinic, ClinicStaff } from '@/types/database';

interface ClinicContextType {
  clinic: Clinic | null;
  clinicStaff: ClinicStaff | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [clinicStaff, setClinicStaff] = useState<ClinicStaff | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClinicData = async () => {
    if (!user) {
      setClinic(null);
      setClinicStaff(null);
      setLoading(false);
      return;
    }

    try {
      // First check if user is staff at any clinic
      const { data: staffData } = await supabase
        .from('clinic_staff')
        .select('*, clinics(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (staffData) {
        setClinicStaff(staffData as unknown as ClinicStaff);
        setClinic((staffData as unknown as { clinics: Clinic }).clinics);
      } else {
        // Check if user owns a clinic
        const { data: ownedClinic } = await supabase
          .from('clinics')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (ownedClinic) {
          setClinic(ownedClinic as unknown as Clinic);
        }
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicData();
  }, [user]);

  const value = {
    clinic,
    clinicStaff,
    loading,
    refetch: fetchClinicData,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
