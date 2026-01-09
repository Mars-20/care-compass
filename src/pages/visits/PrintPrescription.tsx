import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Printer, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface VisitData {
  id: string;
  visit_number: string;
  visit_date: string;
  patient: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    medical_record_number: string;
  };
  clinic: {
    name: string;
    name_en: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
  };
  prescriptions: {
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string | null;
    quantity: number | null;
    instructions: string | null;
  }[];
  doctor: {
    full_name: string | null;
  } | null;
}

export default function PrintPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      if (!id) return;

      try {
        const { data: visitData, error: visitError } = await supabase
          .from('visits')
          .select(`
            id,
            visit_number,
            visit_date,
            doctor_id,
            patients!inner(
              first_name,
              last_name,
              date_of_birth,
              gender,
              phone,
              medical_record_number
            ),
            clinics!inner(
              name,
              name_en,
              address,
              phone,
              email,
              logo_url
            )
          `)
          .eq('id', id)
          .single();

        if (visitError) throw visitError;

        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('visit_id', id);

        let doctorData = null;
        if (visitData.doctor_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', visitData.doctor_id)
            .single();
          doctorData = profile;
        }

        setVisit({
          id: visitData.id,
          visit_number: visitData.visit_number,
          visit_date: visitData.visit_date,
          patient: visitData.patients as VisitData['patient'],
          clinic: visitData.clinics as VisitData['clinic'],
          prescriptions: prescriptions || [],
          doctor: doctorData,
        });
      } catch (error) {
        console.error('Error fetching visit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">الزيارة غير موجودة</p>
      </div>
    );
  }

  return (
    <>
      {/* Print Controls - Hidden on print */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowRight className="w-4 h-4 ml-2" />
          رجوع
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 ml-2" />
          طباعة
        </Button>
      </div>

      {/* Prescription Content */}
      <div className="max-w-[210mm] mx-auto p-8 bg-white min-h-screen print:p-6">
        {/* Header */}
        <div className="border-b-2 border-primary pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary">{visit.clinic.name}</h1>
              {visit.clinic.name_en && (
                <p className="text-lg text-muted-foreground">{visit.clinic.name_en}</p>
              )}
              {visit.clinic.address && (
                <p className="text-sm text-muted-foreground mt-1">{visit.clinic.address}</p>
              )}
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                {visit.clinic.phone && <span>هاتف: {visit.clinic.phone}</span>}
                {visit.clinic.email && <span>بريد: {visit.clinic.email}</span>}
              </div>
            </div>
            {visit.clinic.logo_url && (
              <img
                src={visit.clinic.logo_url}
                alt={visit.clinic.name}
                className="h-16 w-auto object-contain"
              />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">وصفة طبية</h2>
          <p className="text-sm text-muted-foreground">Medical Prescription</p>
        </div>

        {/* Patient Info */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">اسم المريض:</span>
              <span className="font-medium mr-2">
                {visit.patient.first_name} {visit.patient.last_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">رقم الملف:</span>
              <span className="font-medium mr-2">{visit.patient.medical_record_number}</span>
            </div>
            <div>
              <span className="text-muted-foreground">العمر:</span>
              <span className="font-medium mr-2">{calculateAge(visit.patient.date_of_birth)} سنة</span>
            </div>
            <div>
              <span className="text-muted-foreground">الجنس:</span>
              <span className="font-medium mr-2">
                {visit.patient.gender === 'male' ? 'ذكر' : 'أنثى'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">التاريخ:</span>
              <span className="font-medium mr-2">
                {format(new Date(visit.visit_date), 'yyyy/MM/dd', { locale: ar })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">رقم الزيارة:</span>
              <span className="font-medium mr-2">{visit.visit_number}</span>
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <span className="text-2xl ml-2">℞</span>
            الأدوية الموصوفة
          </h3>
          
          {visit.prescriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">لا توجد أدوية موصوفة</p>
          ) : (
            <div className="space-y-4">
              {visit.prescriptions.map((rx, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <span className="text-lg font-bold text-primary">{index + 1}.</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{rx.medication_name}</h4>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">الجرعة:</span>
                          <span className="mr-1">{rx.dosage}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">التكرار:</span>
                          <span className="mr-1">{rx.frequency}</span>
                        </div>
                        {rx.duration && (
                          <div>
                            <span className="text-muted-foreground">المدة:</span>
                            <span className="mr-1">{rx.duration}</span>
                          </div>
                        )}
                        {rx.quantity && (
                          <div>
                            <span className="text-muted-foreground">الكمية:</span>
                            <span className="mr-1">{rx.quantity}</span>
                          </div>
                        )}
                      </div>
                      {rx.instructions && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          تعليمات: {rx.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-6 mt-auto">
          <div className="flex justify-between items-end">
            <div className="text-sm text-muted-foreground">
              <p>تاريخ الطباعة: {format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ar })}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-dashed border-muted-foreground pt-2 px-8">
                <p className="font-medium">{visit.doctor?.full_name || 'الطبيب المعالج'}</p>
                <p className="text-sm text-muted-foreground">التوقيع</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
