import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Patient,
  PatientMedicalHistory,
  PatientAllergy,
  PatientMedication,
  Visit,
} from '@/types/database';
import {
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  Edit,
  Plus,
  Activity,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<PatientMedicalHistory[]>([]);
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id || !clinic) return;

      try {
        // Fetch patient
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .eq('clinic_id', clinic.id)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData as unknown as Patient);

        // Fetch medical history
        const { data: historyData } = await supabase
          .from('patient_medical_history')
          .select('*')
          .eq('patient_id', id)
          .order('created_at', { ascending: false });

        setMedicalHistory((historyData || []) as unknown as PatientMedicalHistory[]);

        // Fetch allergies
        const { data: allergiesData } = await supabase
          .from('patient_allergies')
          .select('*')
          .eq('patient_id', id);

        setAllergies((allergiesData || []) as unknown as PatientAllergy[]);

        // Fetch medications
        const { data: medicationsData } = await supabase
          .from('patient_medications')
          .select('*')
          .eq('patient_id', id)
          .eq('is_current', true);

        setMedications((medicationsData || []) as unknown as PatientMedication[]);

        // Fetch visits
        const { data: visitsData } = await supabase
          .from('visits')
          .select('*')
          .eq('patient_id', id)
          .order('visit_date', { ascending: false })
          .limit(10);

        setVisits((visitsData || []) as unknown as Visit[]);
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل بيانات المريض',
          variant: 'destructive',
        });
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id, clinic, navigate, toast]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getVisitStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success">مكتمل</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning/10 text-warning">جارية</Badge>;
      case 'scheduled':
        return <Badge className="bg-info/10 text-info">مجدولة</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive">ملغاة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'severe':
        return <Badge className="bg-destructive/10 text-destructive">شديدة</Badge>;
      case 'moderate':
        return <Badge className="bg-warning/10 text-warning">متوسطة</Badge>;
      case 'mild':
        return <Badge className="bg-success/10 text-success">خفيفة</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">لم يتم العثور على المريض</h2>
          <Button onClick={() => navigate('/patients')}>العودة للقائمة</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {patient.first_name.charAt(0)}
                  {patient.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-muted-foreground">
                  {patient.medical_record_number} • {calculateAge(patient.date_of_birth)} سنة •{' '}
                  {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/patients/${id}/edit`)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </Button>
            <Button onClick={() => navigate(`/visits/new?patient=${id}`)}>
              <Plus className="ml-2 h-4 w-4" />
              زيارة جديدة
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(allergies.length > 0 || medications.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4">
            {allergies.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">حساسية</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((allergy) => (
                      <Badge key={allergy.id} variant="outline" className="border-destructive/50">
                        {allergy.allergen}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {medications.length > 0 && (
              <Card className="border-info/50 bg-info/5">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-info mb-2">
                    <Pill className="w-5 h-5" />
                    <span className="font-medium">أدوية حالية</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {medications.map((med) => (
                      <Badge key={med.id} variant="outline" className="border-info/50">
                        {med.medication_name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">المعلومات</TabsTrigger>
            <TabsTrigger value="history">التاريخ المرضي</TabsTrigger>
            <TabsTrigger value="visits">الزيارات</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Patient Info */}
          <TabsContent value="info">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    البيانات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الميلاد</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(patient.date_of_birth).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهوية</p>
                      <p className="font-medium">{patient.national_id || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">فصيلة الدم</p>
                      <p className="font-medium">{patient.blood_type || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الطول / الوزن</p>
                      <p className="font-medium">
                        {patient.height_cm ? `${patient.height_cm} سم` : '-'} /{' '}
                        {patient.weight_kg ? `${patient.weight_kg} كجم` : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    معلومات التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                    {patient.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {patient.city}
                          {patient.address && ` - ${patient.address}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {patient.emergency_contact_name && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">جهة الطوارئ</p>
                      <p className="font-medium">
                        {patient.emergency_contact_name} ({patient.emergency_contact_relation})
                      </p>
                      <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical History */}
          <TabsContent value="history">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    الأمراض المزمنة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalHistory.filter((h) => h.condition_type === 'chronic').length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">لا توجد أمراض مزمنة مسجلة</p>
                  ) : (
                    <div className="space-y-3">
                      {medicalHistory
                        .filter((h) => h.condition_type === 'chronic')
                        .map((condition) => (
                          <div key={condition.id} className="p-3 bg-muted/50 rounded-lg">
                            <p className="font-medium">{condition.condition_name}</p>
                            {condition.notes && (
                              <p className="text-sm text-muted-foreground">{condition.notes}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    الحساسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allergies.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">لا توجد حساسية مسجلة</p>
                  ) : (
                    <div className="space-y-3">
                      {allergies.map((allergy) => (
                        <div key={allergy.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{allergy.allergen}</p>
                            {getSeverityBadge(allergy.severity)}
                          </div>
                          {allergy.reaction && (
                            <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visits */}
          <TabsContent value="visits">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    سجل الزيارات
                  </CardTitle>
                  <Button size="sm" onClick={() => navigate(`/visits/new?patient=${id}`)}>
                    <Plus className="ml-2 h-4 w-4" />
                    زيارة جديدة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">لا توجد زيارات مسجلة</p>
                    <Button className="mt-4" onClick={() => navigate(`/visits/new?patient=${id}`)}>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة زيارة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visits.map((visit, index) => (
                      <motion.div
                        key={visit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => navigate(`/visits/${visit.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{visit.visit_number}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(visit.visit_date).toLocaleString('ar-SA')}
                              </p>
                            </div>
                          </div>
                          {getVisitStatusBadge(visit.status)}
                        </div>
                        {visit.chief_complaint && (
                          <p className="text-sm text-muted-foreground">{visit.chief_complaint}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  السجل الطبي الطولي
                </CardTitle>
                <CardDescription>جميع الأحداث الطبية مرتبة زمنياً</CardDescription>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">لا توجد أحداث مسجلة</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute right-4 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-6">
                      {visits.map((visit, index) => (
                        <motion.div
                          key={visit.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pr-10"
                        >
                          <div className="absolute right-2 top-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{visit.visit_number}</span>
                              {getVisitStatusBadge(visit.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(visit.visit_date).toLocaleString('ar-SA')}
                            </p>
                            {visit.chief_complaint && (
                              <p className="text-sm">{visit.chief_complaint}</p>
                            )}
                            {visit.assessment && (
                              <p className="text-sm mt-2 text-muted-foreground">
                                التقييم: {visit.assessment}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
