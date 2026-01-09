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
  visit_type: string;
  status: string;
  chief_complaint: string | null;
  history_of_present_illness: string | null;
  physical_examination: string | null;
  assessment: string | null;
  plan: string | null;
  notes: string | null;
  temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  patient: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    medical_record_number: string;
    blood_type: string | null;
  };
  clinic: {
    name: string;
    name_en: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
  };
  diagnoses: {
    diagnosis_name: string;
    diagnosis_type: string;
    diagnosis_code: string | null;
    notes: string | null;
  }[];
  prescriptions: {
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string | null;
    instructions: string | null;
  }[];
  lab_orders: {
    test_name: string;
    status: string | null;
    results: string | null;
  }[];
  doctor: {
    full_name: string | null;
  } | null;
}

export default function PrintReport() {
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
            *,
            patients!inner(
              first_name,
              last_name,
              date_of_birth,
              gender,
              phone,
              medical_record_number,
              blood_type
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

        const [{ data: diagnoses }, { data: prescriptions }, { data: labOrders }] = await Promise.all([
          supabase.from('diagnoses').select('*').eq('visit_id', id),
          supabase.from('prescriptions').select('*').eq('visit_id', id),
          supabase.from('lab_orders').select('*').eq('visit_id', id),
        ]);

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
          ...visitData,
          patient: visitData.patients as VisitData['patient'],
          clinic: visitData.clinics as VisitData['clinic'],
          diagnoses: diagnoses || [],
          prescriptions: prescriptions || [],
          lab_orders: labOrders || [],
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

  const visitTypeLabels: Record<string, string> = {
    initial: 'زيارة أولى',
    follow_up: 'متابعة',
    emergency: 'طوارئ',
    routine: 'روتينية',
    consultation: 'استشارة',
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
      {/* Print Controls */}
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

      {/* Report Content */}
      <div className="max-w-[210mm] mx-auto p-8 bg-white min-h-screen print:p-6 text-sm">
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
          <h2 className="text-xl font-bold">تقرير طبي</h2>
          <p className="text-muted-foreground">Medical Report</p>
        </div>

        {/* Patient Info */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">بيانات المريض</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">الاسم:</span>
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
              <span className="text-muted-foreground">فصيلة الدم:</span>
              <span className="font-medium mr-2">{visit.patient.blood_type || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">الهاتف:</span>
              <span className="font-medium mr-2" dir="ltr">{visit.patient.phone}</span>
            </div>
          </div>
        </div>

        {/* Visit Info */}
        <div className="bg-primary/5 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">بيانات الزيارة</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">رقم الزيارة:</span>
              <span className="font-medium mr-2">{visit.visit_number}</span>
            </div>
            <div>
              <span className="text-muted-foreground">التاريخ:</span>
              <span className="font-medium mr-2">
                {format(new Date(visit.visit_date), 'yyyy/MM/dd', { locale: ar })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">نوع الزيارة:</span>
              <span className="font-medium mr-2">{visitTypeLabels[visit.visit_type] || visit.visit_type}</span>
            </div>
          </div>
        </div>

        {/* Vitals */}
        {(visit.temperature || visit.blood_pressure_systolic || visit.heart_rate) && (
          <div className="mb-6">
            <h3 className="font-bold mb-3">العلامات الحيوية</h3>
            <div className="grid grid-cols-4 gap-4">
              {visit.blood_pressure_systolic && visit.blood_pressure_diastolic && (
                <div className="border rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">ضغط الدم</p>
                  <p className="font-bold">{visit.blood_pressure_systolic}/{visit.blood_pressure_diastolic}</p>
                  <p className="text-xs">mmHg</p>
                </div>
              )}
              {visit.heart_rate && (
                <div className="border rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">النبض</p>
                  <p className="font-bold">{visit.heart_rate}</p>
                  <p className="text-xs">bpm</p>
                </div>
              )}
              {visit.temperature && (
                <div className="border rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">الحرارة</p>
                  <p className="font-bold">{visit.temperature}</p>
                  <p className="text-xs">°C</p>
                </div>
              )}
              {visit.oxygen_saturation && (
                <div className="border rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">الأكسجين</p>
                  <p className="font-bold">{visit.oxygen_saturation}%</p>
                  <p className="text-xs">SpO2</p>
                </div>
              )}
              {visit.weight_kg && (
                <div className="border rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">الوزن</p>
                  <p className="font-bold">{visit.weight_kg}</p>
                  <p className="text-xs">kg</p>
                </div>
              )}
              {visit.height_cm && (
                <div className="border rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">الطول</p>
                  <p className="font-bold">{visit.height_cm}</p>
                  <p className="text-xs">cm</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clinical Notes */}
        <div className="space-y-4 mb-6">
          {visit.chief_complaint && (
            <div>
              <h3 className="font-bold">الشكوى الرئيسية</h3>
              <p className="mt-1 p-2 bg-muted/30 rounded">{visit.chief_complaint}</p>
            </div>
          )}
          {visit.history_of_present_illness && (
            <div>
              <h3 className="font-bold">تاريخ المرض الحالي</h3>
              <p className="mt-1 p-2 bg-muted/30 rounded">{visit.history_of_present_illness}</p>
            </div>
          )}
          {visit.physical_examination && (
            <div>
              <h3 className="font-bold">الفحص السريري</h3>
              <p className="mt-1 p-2 bg-muted/30 rounded">{visit.physical_examination}</p>
            </div>
          )}
          {visit.assessment && (
            <div>
              <h3 className="font-bold">التقييم</h3>
              <p className="mt-1 p-2 bg-muted/30 rounded">{visit.assessment}</p>
            </div>
          )}
          {visit.plan && (
            <div>
              <h3 className="font-bold">الخطة العلاجية</h3>
              <p className="mt-1 p-2 bg-muted/30 rounded">{visit.plan}</p>
            </div>
          )}
        </div>

        {/* Diagnoses */}
        {visit.diagnoses.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">التشخيصات</h3>
            <ul className="list-disc list-inside space-y-1">
              {visit.diagnoses.map((dx, i) => (
                <li key={i}>
                  <span className="font-medium">{dx.diagnosis_name}</span>
                  {dx.diagnosis_code && (
                    <span className="text-muted-foreground"> ({dx.diagnosis_code})</span>
                  )}
                  <span className="text-xs text-muted-foreground mr-2">
                    - {dx.diagnosis_type === 'primary' ? 'رئيسي' : 'ثانوي'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prescriptions */}
        {visit.prescriptions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">الأدوية الموصوفة</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 text-right">الدواء</th>
                  <th className="border p-2 text-right">الجرعة</th>
                  <th className="border p-2 text-right">التكرار</th>
                  <th className="border p-2 text-right">المدة</th>
                </tr>
              </thead>
              <tbody>
                {visit.prescriptions.map((rx, i) => (
                  <tr key={i}>
                    <td className="border p-2">{rx.medication_name}</td>
                    <td className="border p-2">{rx.dosage}</td>
                    <td className="border p-2">{rx.frequency}</td>
                    <td className="border p-2">{rx.duration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Lab Orders */}
        {visit.lab_orders.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">الفحوصات المخبرية</h3>
            <ul className="list-disc list-inside space-y-1">
              {visit.lab_orders.map((lab, i) => (
                <li key={i}>
                  {lab.test_name}
                  {lab.results && <span className="text-muted-foreground"> - النتيجة: {lab.results}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-6 mt-8">
          <div className="flex justify-between items-end">
            <div className="text-xs text-muted-foreground">
              <p>تاريخ الطباعة: {format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ar })}</p>
              <p className="mt-1">هذا التقرير صادر إلكترونياً من نظام ماركتولوجي</p>
            </div>
            <div className="text-center">
              <div className="border-t border-dashed border-muted-foreground pt-2 px-12">
                <p className="font-medium">{visit.doctor?.full_name || 'الطبيب المعالج'}</p>
                <p className="text-xs text-muted-foreground">التوقيع والختم</p>
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
