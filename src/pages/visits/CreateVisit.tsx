import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Patient } from '@/types/database';
import {
  ArrowRight,
  Stethoscope,
  User,
  Search,
  AlertTriangle,
  Pill,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const visitSchema = z.object({
  patient_id: z.string().min(1, 'يرجى اختيار المريض'),
  visit_type: z.string().min(1, 'يرجى اختيار نوع الزيارة'),
  chief_complaint: z.string().optional(),
  notes: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

const CreateVisit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patient_id: searchParams.get('patient') || '',
      visit_type: '',
      chief_complaint: '',
      notes: '',
    },
  });

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!clinic) return;

      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .order('first_name');

      setPatients((data || []) as unknown as Patient[]);

      // If patient ID is in URL, select that patient
      const patientId = searchParams.get('patient');
      if (patientId && data) {
        const patient = data.find((p) => p.id === patientId);
        if (patient) {
          setSelectedPatient(patient as unknown as Patient);
          form.setValue('patient_id', patientId);
          fetchPatientDetails(patientId);
        }
      }
    };

    fetchPatients();
  }, [clinic, searchParams, form]);

  const fetchPatientDetails = async (patientId: string) => {
    // Fetch allergies
    const { data: allergiesData } = await supabase
      .from('patient_allergies')
      .select('allergen')
      .eq('patient_id', patientId);

    setAllergies((allergiesData || []).map((a) => a.allergen));

    // Fetch current medications
    const { data: medsData } = await supabase
      .from('patient_medications')
      .select('medication_name')
      .eq('patient_id', patientId)
      .eq('is_current', true);

    setMedications((medsData || []).map((m) => m.medication_name));
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatient(patient || null);
    form.setValue('patient_id', patientId);
    if (patient) {
      fetchPatientDetails(patientId);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const searchLower = patientSearch.toLowerCase();
    return (
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchLower) ||
      patient.medical_record_number.toLowerCase().includes(searchLower) ||
      patient.phone.includes(patientSearch)
    );
  });

  const onSubmit = async (data: VisitFormData) => {
    if (!clinic || !user) return;

    setLoading(true);
    try {
      // Generate visit number
      const { data: visitNumber } = await supabase.rpc('generate_visit_number', {
        _clinic_id: clinic.id,
      });

      const { data: visit, error } = await supabase
        .from('visits')
        .insert({
          clinic_id: clinic.id,
          patient_id: data.patient_id,
          doctor_id: user.id,
          visit_number: visitNumber || `V-${Date.now()}`,
          visit_type: data.visit_type,
          chief_complaint: data.chief_complaint || null,
          notes: data.notes || null,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'تم إنشاء الزيارة',
        description: 'يمكنك الآن إضافة التفاصيل الطبية',
      });

      navigate(`/visits/${visit.id}`);
    } catch (error) {
      console.error('Error creating visit:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الزيارة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">زيارة جديدة</h1>
            <p className="text-muted-foreground">إنشاء سجل زيارة جديد للمريض</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  اختيار المريض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedPatient ? (
                  <>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="بحث بالاسم أو رقم السجل أو الهاتف..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pr-10"
                      />
                    </div>

                    {patientSearch && (
                      <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                        {filteredPatients.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            لا توجد نتائج
                          </p>
                        ) : (
                          filteredPatients.slice(0, 10).map((patient) => (
                            <div
                              key={patient.id}
                              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => handlePatientSelect(patient.id)}
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium text-primary">
                                  {patient.first_name.charAt(0)}
                                  {patient.last_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {patient.first_name} {patient.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {patient.medical_record_number} • {patient.phone}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/patients/new?redirect=visit')}
                    >
                      <User className="ml-2 h-4 w-4" />
                      تسجيل مريض جديد
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {selectedPatient.first_name.charAt(0)}
                          {selectedPatient.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.medical_record_number} •{' '}
                          {new Date().getFullYear() -
                            new Date(selectedPatient.date_of_birth).getFullYear()}{' '}
                          سنة • {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(null);
                          form.setValue('patient_id', '');
                          setPatientSearch('');
                          setAllergies([]);
                          setMedications([]);
                        }}
                      >
                        تغيير
                      </Button>
                    </div>

                    {/* Alerts */}
                    {(allergies.length > 0 || medications.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {allergies.length > 0 && (
                          <div className="p-3 border border-destructive/50 bg-destructive/5 rounded-lg">
                            <div className="flex items-center gap-2 text-destructive mb-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium text-sm">حساسية</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {allergies.map((allergy, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="border-destructive/50 text-xs"
                                >
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {medications.length > 0 && (
                          <div className="p-3 border border-info/50 bg-info/5 rounded-lg">
                            <div className="flex items-center gap-2 text-info mb-2">
                              <Pill className="w-4 h-4" />
                              <span className="font-medium text-sm">أدوية حالية</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {medications.map((med, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="border-info/50 text-xs"
                                >
                                  {med}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="patient_id"
                  render={() => (
                    <FormItem className="hidden">
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Visit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  تفاصيل الزيارة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="visit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الزيارة *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الزيارة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">زيارة جديدة</SelectItem>
                          <SelectItem value="follow_up">متابعة</SelectItem>
                          <SelectItem value="emergency">طوارئ</SelectItem>
                          <SelectItem value="routine_checkup">فحص دوري</SelectItem>
                          <SelectItem value="consultation">استشارة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chief_complaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الشكوى الرئيسية</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف الشكوى الرئيسية للمريض..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ملاحظات إضافية..."
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Stethoscope className="ml-2 h-4 w-4" />
                    بدء الزيارة
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CreateVisit;
