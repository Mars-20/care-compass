import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Visit,
  Patient,
  Diagnosis,
  Prescription,
  LabOrder,
  FollowUp,
} from '@/types/database';
import {
  ArrowRight,
  User,
  Stethoscope,
  Heart,
  Thermometer,
  Activity,
  Plus,
  Pill,
  FileText,
  FlaskConical,
  Calendar,
  Save,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisitWithPatient extends Visit {
  patients: Patient;
}

const VisitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [visit, setVisit] = useState<VisitWithPatient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [vitals, setVitals] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight_kg: '',
    height_cm: '',
  });
  const [notes, setNotes] = useState({
    chief_complaint: '',
    history_of_present_illness: '',
    physical_examination: '',
    assessment: '',
    plan: '',
    notes: '',
  });

  // Dialogs
  const [diagnosisDialog, setDiagnosisDialog] = useState(false);
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [labDialog, setLabDialog] = useState(false);
  const [followUpDialog, setFollowUpDialog] = useState(false);

  // New item forms
  const [newDiagnosis, setNewDiagnosis] = useState({
    diagnosis_name: '',
    diagnosis_type: 'primary',
    diagnosis_code: '',
    notes: '',
  });
  const [newPrescription, setNewPrescription] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: '',
  });
  const [newLabOrder, setNewLabOrder] = useState({
    test_name: '',
    test_code: '',
    urgency: 'routine',
    notes: '',
  });
  const [newFollowUp, setNewFollowUp] = useState({
    follow_up_date: '',
    reason: '',
    instructions: '',
  });

  useEffect(() => {
    fetchVisitData();
  }, [id, clinic]);

  const fetchVisitData = async () => {
    if (!id || !clinic) return;

    try {
      // Fetch visit with patient
      const { data: visitData, error } = await supabase
        .from('visits')
        .select('*, patients(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVisit(visitData as unknown as VisitWithPatient);

      // Set form values
      setVitals({
        blood_pressure_systolic: visitData.blood_pressure_systolic?.toString() || '',
        blood_pressure_diastolic: visitData.blood_pressure_diastolic?.toString() || '',
        heart_rate: visitData.heart_rate?.toString() || '',
        temperature: visitData.temperature?.toString() || '',
        respiratory_rate: visitData.respiratory_rate?.toString() || '',
        oxygen_saturation: visitData.oxygen_saturation?.toString() || '',
        weight_kg: visitData.weight_kg?.toString() || '',
        height_cm: visitData.height_cm?.toString() || '',
      });
      setNotes({
        chief_complaint: visitData.chief_complaint || '',
        history_of_present_illness: visitData.history_of_present_illness || '',
        physical_examination: visitData.physical_examination || '',
        assessment: visitData.assessment || '',
        plan: visitData.plan || '',
        notes: visitData.notes || '',
      });

      // Fetch related data
      const [diagnosesRes, prescriptionsRes, labOrdersRes, followUpsRes] = await Promise.all([
        supabase.from('diagnoses').select('*').eq('visit_id', id),
        supabase.from('prescriptions').select('*').eq('visit_id', id),
        supabase.from('lab_orders').select('*').eq('visit_id', id),
        supabase.from('follow_ups').select('*').eq('visit_id', id),
      ]);

      setDiagnoses((diagnosesRes.data || []) as unknown as Diagnosis[]);
      setPrescriptions((prescriptionsRes.data || []) as unknown as Prescription[]);
      setLabOrders((labOrdersRes.data || []) as unknown as LabOrder[]);
      setFollowUps((followUpsRes.data || []) as unknown as FollowUp[]);
    } catch (error) {
      console.error('Error fetching visit:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الزيارة',
        variant: 'destructive',
      });
      navigate('/visits');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVitals = async () => {
    if (!visit) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('visits')
        .update({
          blood_pressure_systolic: vitals.blood_pressure_systolic ? parseInt(vitals.blood_pressure_systolic) : null,
          blood_pressure_diastolic: vitals.blood_pressure_diastolic ? parseInt(vitals.blood_pressure_diastolic) : null,
          heart_rate: vitals.heart_rate ? parseInt(vitals.heart_rate) : null,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          respiratory_rate: vitals.respiratory_rate ? parseInt(vitals.respiratory_rate) : null,
          oxygen_saturation: vitals.oxygen_saturation ? parseInt(vitals.oxygen_saturation) : null,
          weight_kg: vitals.weight_kg ? parseFloat(vitals.weight_kg) : null,
          height_cm: vitals.height_cm ? parseFloat(vitals.height_cm) : null,
          ...notes,
        })
        .eq('id', visit.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ بيانات الزيارة',
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ البيانات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteVisit = async () => {
    if (!visit) return;
    setSaving(true);

    try {
      await handleSaveVitals();

      const { error } = await supabase
        .from('visits')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', visit.id);

      if (error) throw error;

      toast({
        title: 'تم إنهاء الزيارة',
        description: 'تم إنهاء الزيارة بنجاح',
      });

      navigate('/visits');
    } catch (error) {
      console.error('Error completing visit:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنهاء الزيارة',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDiagnosis = async () => {
    if (!visit || !newDiagnosis.diagnosis_name) return;

    try {
      const { data, error } = await supabase
        .from('diagnoses')
        .insert({
          visit_id: visit.id,
          patient_id: visit.patient_id,
          diagnosis_name: newDiagnosis.diagnosis_name,
          diagnosis_type: newDiagnosis.diagnosis_type,
          diagnosis_code: newDiagnosis.diagnosis_code || null,
          notes: newDiagnosis.notes || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setDiagnoses([...diagnoses, data as unknown as Diagnosis]);
      setNewDiagnosis({ diagnosis_name: '', diagnosis_type: 'primary', diagnosis_code: '', notes: '' });
      setDiagnosisDialog(false);
      toast({ title: 'تم', description: 'تمت إضافة التشخيص' });
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      toast({ title: 'خطأ', description: 'فشل في إضافة التشخيص', variant: 'destructive' });
    }
  };

  const handleAddPrescription = async () => {
    if (!visit || !newPrescription.medication_name || !newPrescription.dosage || !newPrescription.frequency) return;

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          visit_id: visit.id,
          patient_id: visit.patient_id,
          medication_name: newPrescription.medication_name,
          dosage: newPrescription.dosage,
          frequency: newPrescription.frequency,
          duration: newPrescription.duration || null,
          quantity: newPrescription.quantity ? parseInt(newPrescription.quantity) : null,
          instructions: newPrescription.instructions || null,
          prescribed_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setPrescriptions([...prescriptions, data as unknown as Prescription]);
      setNewPrescription({ medication_name: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' });
      setPrescriptionDialog(false);
      toast({ title: 'تم', description: 'تمت إضافة الوصفة' });
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast({ title: 'خطأ', description: 'فشل في إضافة الوصفة', variant: 'destructive' });
    }
  };

  const handleAddLabOrder = async () => {
    if (!visit || !newLabOrder.test_name) return;

    try {
      const { data, error } = await supabase
        .from('lab_orders')
        .insert({
          visit_id: visit.id,
          patient_id: visit.patient_id,
          test_name: newLabOrder.test_name,
          test_code: newLabOrder.test_code || null,
          urgency: newLabOrder.urgency,
          notes: newLabOrder.notes || null,
          ordered_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLabOrders([...labOrders, data as unknown as LabOrder]);
      setNewLabOrder({ test_name: '', test_code: '', urgency: 'routine', notes: '' });
      setLabDialog(false);
      toast({ title: 'تم', description: 'تمت إضافة طلب الفحص' });
    } catch (error) {
      console.error('Error adding lab order:', error);
      toast({ title: 'خطأ', description: 'فشل في إضافة طلب الفحص', variant: 'destructive' });
    }
  };

  const handleAddFollowUp = async () => {
    if (!visit || !clinic || !newFollowUp.follow_up_date || !newFollowUp.reason) return;

    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          visit_id: visit.id,
          patient_id: visit.patient_id,
          clinic_id: clinic.id,
          follow_up_date: newFollowUp.follow_up_date,
          reason: newFollowUp.reason,
          instructions: newFollowUp.instructions || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setFollowUps([...followUps, data as unknown as FollowUp]);
      setNewFollowUp({ follow_up_date: '', reason: '', instructions: '' });
      setFollowUpDialog(false);
      toast({ title: 'تم', description: 'تمت إضافة موعد المتابعة' });
    } catch (error) {
      console.error('Error adding follow-up:', error);
      toast({ title: 'خطأ', description: 'فشل في إضافة موعد المتابعة', variant: 'destructive' });
    }
  };

  const handleDeleteDiagnosis = async (diagnosisId: string) => {
    try {
      const { error } = await supabase.from('diagnoses').delete().eq('id', diagnosisId);
      if (error) throw error;
      setDiagnoses(diagnoses.filter((d) => d.id !== diagnosisId));
      toast({ title: 'تم', description: 'تم حذف التشخيص' });
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في الحذف', variant: 'destructive' });
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      const { error } = await supabase.from('prescriptions').delete().eq('id', prescriptionId);
      if (error) throw error;
      setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId));
      toast({ title: 'تم', description: 'تم حذف الوصفة' });
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في الحذف', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!visit) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Stethoscope className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">لم يتم العثور على الزيارة</h2>
          <Button onClick={() => navigate('/visits')}>العودة للقائمة</Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success">مكتمل</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning/10 text-warning">جارية</Badge>;
      case 'scheduled':
        return <Badge className="bg-info/10 text-info">مجدولة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/visits')}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {visit.patients.first_name.charAt(0)}
                  {visit.patients.last_name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">
                    {visit.patients.first_name} {visit.patients.last_name}
                  </h1>
                  {getStatusBadge(visit.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {visit.visit_number} •{' '}
                  {new Date(visit.visit_date).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveVitals} disabled={saving}>
              <Save className="ml-2 h-4 w-4" />
              حفظ
            </Button>
            {visit.status !== 'completed' && (
              <Button onClick={handleCompleteVisit} disabled={saving}>
                <CheckCircle className="ml-2 h-4 w-4" />
                إنهاء الزيارة
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vitals" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="vitals">العلامات الحيوية</TabsTrigger>
            <TabsTrigger value="notes">الملاحظات</TabsTrigger>
            <TabsTrigger value="diagnoses">التشخيصات ({diagnoses.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">الوصفات ({prescriptions.length})</TabsTrigger>
            <TabsTrigger value="labs">الفحوصات ({labOrders.length})</TabsTrigger>
          </TabsList>

          {/* Vitals */}
          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  العلامات الحيوية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-destructive" />
                      ضغط الدم
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="انقباضي"
                        value={vitals.blood_pressure_systolic}
                        onChange={(e) => setVitals({ ...vitals, blood_pressure_systolic: e.target.value })}
                      />
                      <span className="self-center">/</span>
                      <Input
                        type="number"
                        placeholder="انبساطي"
                        value={vitals.blood_pressure_diastolic}
                        onChange={(e) => setVitals({ ...vitals, blood_pressure_diastolic: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-primary" />
                      معدل النبض
                    </Label>
                    <Input
                      type="number"
                      placeholder="/دقيقة"
                      value={vitals.heart_rate}
                      onChange={(e) => setVitals({ ...vitals, heart_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4 text-warning" />
                      الحرارة
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="°C"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>معدل التنفس</Label>
                    <Input
                      type="number"
                      placeholder="/دقيقة"
                      value={vitals.respiratory_rate}
                      onChange={(e) => setVitals({ ...vitals, respiratory_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تشبع الأكسجين %</Label>
                    <Input
                      type="number"
                      placeholder="%"
                      value={vitals.oxygen_saturation}
                      onChange={(e) => setVitals({ ...vitals, oxygen_saturation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوزن (كجم)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vitals.weight_kg}
                      onChange={(e) => setVitals({ ...vitals, weight_kg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الطول (سم)</Label>
                    <Input
                      type="number"
                      value={vitals.height_cm}
                      onChange={(e) => setVitals({ ...vitals, height_cm: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الشكوى الرئيسية</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="الشكوى الرئيسية للمريض..."
                    value={notes.chief_complaint}
                    onChange={(e) => setNotes({ ...notes, chief_complaint: e.target.value })}
                    rows={3}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>تاريخ المرض الحالي</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="تفاصيل تاريخ المرض الحالي..."
                    value={notes.history_of_present_illness}
                    onChange={(e) => setNotes({ ...notes, history_of_present_illness: e.target.value })}
                    rows={3}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>الفحص السريري</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="نتائج الفحص السريري..."
                    value={notes.physical_examination}
                    onChange={(e) => setNotes({ ...notes, physical_examination: e.target.value })}
                    rows={3}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>التقييم</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="التقييم الطبي..."
                    value={notes.assessment}
                    onChange={(e) => setNotes({ ...notes, assessment: e.target.value })}
                    rows={3}
                  />
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>الخطة العلاجية</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="الخطة العلاجية والتوصيات..."
                    value={notes.plan}
                    onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diagnoses */}
          <TabsContent value="diagnoses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    التشخيصات
                  </CardTitle>
                  <Dialog open={diagnosisDialog} onOpenChange={setDiagnosisDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة تشخيص
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة تشخيص جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>اسم التشخيص *</Label>
                          <Input
                            value={newDiagnosis.diagnosis_name}
                            onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosis_name: e.target.value })}
                            placeholder="اسم التشخيص"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>نوع التشخيص</Label>
                          <Select
                            value={newDiagnosis.diagnosis_type}
                            onValueChange={(value) => setNewDiagnosis({ ...newDiagnosis, diagnosis_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">رئيسي</SelectItem>
                              <SelectItem value="secondary">ثانوي</SelectItem>
                              <SelectItem value="differential">تفريقي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>رمز التشخيص (ICD)</Label>
                          <Input
                            value={newDiagnosis.diagnosis_code}
                            onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosis_code: e.target.value })}
                            placeholder="مثال: J06.9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ملاحظات</Label>
                          <Textarea
                            value={newDiagnosis.notes}
                            onChange={(e) => setNewDiagnosis({ ...newDiagnosis, notes: e.target.value })}
                            placeholder="ملاحظات إضافية..."
                          />
                        </div>
                        <Button onClick={handleAddDiagnosis} className="w-full">
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {diagnoses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد تشخيصات</p>
                ) : (
                  <div className="space-y-3">
                    {diagnoses.map((diagnosis) => (
                      <div key={diagnosis.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{diagnosis.diagnosis_name}</p>
                            <Badge variant="outline">
                              {diagnosis.diagnosis_type === 'primary' ? 'رئيسي' : diagnosis.diagnosis_type === 'secondary' ? 'ثانوي' : 'تفريقي'}
                            </Badge>
                          </div>
                          {diagnosis.diagnosis_code && (
                            <p className="text-sm text-muted-foreground">{diagnosis.diagnosis_code}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDiagnosis(diagnosis.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions */}
          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    الوصفات الطبية
                  </CardTitle>
                  <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة دواء
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة دواء جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>اسم الدواء *</Label>
                          <Input
                            value={newPrescription.medication_name}
                            onChange={(e) => setNewPrescription({ ...newPrescription, medication_name: e.target.value })}
                            placeholder="اسم الدواء"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>الجرعة *</Label>
                            <Input
                              value={newPrescription.dosage}
                              onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                              placeholder="مثال: 500mg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>التكرار *</Label>
                            <Input
                              value={newPrescription.frequency}
                              onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                              placeholder="مثال: مرتين يومياً"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>المدة</Label>
                            <Input
                              value={newPrescription.duration}
                              onChange={(e) => setNewPrescription({ ...newPrescription, duration: e.target.value })}
                              placeholder="مثال: 7 أيام"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>الكمية</Label>
                            <Input
                              type="number"
                              value={newPrescription.quantity}
                              onChange={(e) => setNewPrescription({ ...newPrescription, quantity: e.target.value })}
                              placeholder="عدد الوحدات"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>تعليمات</Label>
                          <Textarea
                            value={newPrescription.instructions}
                            onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                            placeholder="تعليمات الاستخدام..."
                          />
                        </div>
                        <Button onClick={handleAddPrescription} className="w-full">
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد وصفات</p>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{prescription.medication_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {prescription.dosage} • {prescription.frequency}
                            {prescription.duration && ` • ${prescription.duration}`}
                          </p>
                          {prescription.instructions && (
                            <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePrescription(prescription.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up Section */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    مواعيد المتابعة
                  </CardTitle>
                  <Dialog open={followUpDialog} onOpenChange={setFollowUpDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة متابعة
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة موعد متابعة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>تاريخ المتابعة *</Label>
                          <Input
                            type="date"
                            value={newFollowUp.follow_up_date}
                            onChange={(e) => setNewFollowUp({ ...newFollowUp, follow_up_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>السبب *</Label>
                          <Input
                            value={newFollowUp.reason}
                            onChange={(e) => setNewFollowUp({ ...newFollowUp, reason: e.target.value })}
                            placeholder="سبب المتابعة"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>تعليمات</Label>
                          <Textarea
                            value={newFollowUp.instructions}
                            onChange={(e) => setNewFollowUp({ ...newFollowUp, instructions: e.target.value })}
                            placeholder="تعليمات للمريض..."
                          />
                        </div>
                        <Button onClick={handleAddFollowUp} className="w-full">
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {followUps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا توجد مواعيد متابعة</p>
                ) : (
                  <div className="space-y-3">
                    {followUps.map((followUp) => (
                      <div key={followUp.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{followUp.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(followUp.follow_up_date).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={followUp.status === 'pending' ? 'default' : 'secondary'}>
                          {followUp.status === 'pending' ? 'معلق' : followUp.status === 'completed' ? 'مكتمل' : 'متأخر'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labs */}
          <TabsContent value="labs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    طلبات الفحوصات
                  </CardTitle>
                  <Dialog open={labDialog} onOpenChange={setLabDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="ml-2 h-4 w-4" />
                        طلب فحص
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>طلب فحص مخبري</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>اسم الفحص *</Label>
                          <Input
                            value={newLabOrder.test_name}
                            onChange={(e) => setNewLabOrder({ ...newLabOrder, test_name: e.target.value })}
                            placeholder="اسم الفحص"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>رمز الفحص</Label>
                          <Input
                            value={newLabOrder.test_code}
                            onChange={(e) => setNewLabOrder({ ...newLabOrder, test_code: e.target.value })}
                            placeholder="رمز الفحص (اختياري)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>الأولوية</Label>
                          <Select
                            value={newLabOrder.urgency}
                            onValueChange={(value) => setNewLabOrder({ ...newLabOrder, urgency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="routine">روتيني</SelectItem>
                              <SelectItem value="urgent">عاجل</SelectItem>
                              <SelectItem value="stat">طارئ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>ملاحظات</Label>
                          <Textarea
                            value={newLabOrder.notes}
                            onChange={(e) => setNewLabOrder({ ...newLabOrder, notes: e.target.value })}
                            placeholder="ملاحظات إضافية..."
                          />
                        </div>
                        <Button onClick={handleAddLabOrder} className="w-full">
                          إضافة
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {labOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات فحوصات</p>
                ) : (
                  <div className="space-y-3">
                    {labOrders.map((lab) => (
                      <div key={lab.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FlaskConical className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{lab.test_name}</p>
                            {lab.test_code && (
                              <p className="text-sm text-muted-foreground">{lab.test_code}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={lab.urgency === 'stat' ? 'destructive' : lab.urgency === 'urgent' ? 'default' : 'secondary'}>
                            {lab.urgency === 'routine' ? 'روتيني' : lab.urgency === 'urgent' ? 'عاجل' : 'طارئ'}
                          </Badge>
                          <Badge variant="outline">
                            {lab.status === 'ordered' ? 'مطلوب' : lab.status === 'completed' ? 'مكتمل' : lab.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
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

export default VisitDetails;
