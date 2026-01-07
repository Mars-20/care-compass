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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Heart,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    national_id: '',
    phone: '',
    phone_secondary: '',
    email: '',
    address: '',
    city: '',
    blood_type: '',
    height_cm: '',
    weight_kg: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    insurance_provider: '',
    insurance_number: '',
    insurance_expiry: '',
    notes: '',
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id || !clinic) return;

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .eq('clinic_id', clinic.id)
          .single();

        if (error) throw error;
        
        const patientData = data as unknown as Patient;
        setPatient(patientData);
        setForm({
          first_name: patientData.first_name || '',
          last_name: patientData.last_name || '',
          date_of_birth: patientData.date_of_birth || '',
          gender: patientData.gender || 'male',
          national_id: patientData.national_id || '',
          phone: patientData.phone || '',
          phone_secondary: patientData.phone_secondary || '',
          email: patientData.email || '',
          address: patientData.address || '',
          city: patientData.city || '',
          blood_type: patientData.blood_type || '',
          height_cm: patientData.height_cm?.toString() || '',
          weight_kg: patientData.weight_kg?.toString() || '',
          emergency_contact_name: patientData.emergency_contact_name || '',
          emergency_contact_phone: patientData.emergency_contact_phone || '',
          emergency_contact_relation: patientData.emergency_contact_relation || '',
          insurance_provider: patientData.insurance_provider || '',
          insurance_number: patientData.insurance_number || '',
          insurance_expiry: patientData.insurance_expiry || '',
          notes: patientData.notes || '',
        });
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

    fetchPatient();
  }, [id, clinic, navigate, toast]);

  const handleSave = async () => {
    if (!patient || !form.first_name || !form.last_name || !form.phone) {
      toast({
        title: 'خطأ',
        description: 'يرجى تعبئة الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          national_id: form.national_id || null,
          phone: form.phone,
          phone_secondary: form.phone_secondary || null,
          email: form.email || null,
          address: form.address || null,
          city: form.city || null,
          blood_type: form.blood_type || null,
          height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
          weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
          emergency_contact_name: form.emergency_contact_name || null,
          emergency_contact_phone: form.emergency_contact_phone || null,
          emergency_contact_relation: form.emergency_contact_relation || null,
          insurance_provider: form.insurance_provider || null,
          insurance_number: form.insurance_number || null,
          insurance_expiry: form.insurance_expiry || null,
          notes: form.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patient.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث بيانات المريض بنجاح',
      });

      navigate(`/patients/${patient.id}`);
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التغييرات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">تعديل بيانات المريض</h1>
            <p className="text-muted-foreground">{patient.medical_record_number}</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                البيانات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الاسم الأول *</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>اسم العائلة *</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ الميلاد *</Label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الجنس *</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رقم الهوية</Label>
                <Input
                  value={form.national_id}
                  onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                معلومات التواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الهاتف *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم هاتف إضافي</Label>
                <Input
                  value={form.phone_secondary}
                  onChange={(e) => setForm({ ...form, phone_secondary: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>المدينة</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>العنوان</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                المعلومات الطبية
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>فصيلة الدم</Label>
                <Select value={form.blood_type} onValueChange={(v) => setForm({ ...form, blood_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الطول (سم)</Label>
                <Input
                  type="number"
                  value={form.height_cm}
                  onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الوزن (كجم)</Label>
                <Input
                  type="number"
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                جهة الطوارئ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={form.emergency_contact_phone}
                  onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>صلة القرابة</Label>
                <Input
                  value={form.emergency_contact_relation}
                  onChange={(e) => setForm({ ...form, emergency_contact_relation: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="ملاحظات إضافية..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="ml-2 h-4 w-4" />
              {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default EditPatient;
