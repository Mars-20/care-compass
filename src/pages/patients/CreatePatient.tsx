import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight,
  User,
  Phone,
  Heart,
  Shield,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { z } from 'zod';
import { BloodType, Gender } from '@/types/database';

const patientSchema = z.object({
  first_name: z.string().min(2, 'الاسم الأول مطلوب'),
  last_name: z.string().min(2, 'اسم العائلة مطلوب'),
  date_of_birth: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  gender: z.enum(['male', 'female'], { required_error: 'الجنس مطلوب' }),
  phone: z.string().min(9, 'رقم الهاتف مطلوب'),
  national_id: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  blood_type: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),
  notes: z.string().optional(),
});

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreatePatient = () => {
  const { user } = useAuth();
  const { clinic, loading: clinicLoading } = useClinic();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '' as Gender | '',
    national_id: '',
    phone: '',
    phone_secondary: '',
    email: '',
    address: '',
    city: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    blood_type: '',
    height_cm: '',
    weight_kg: '',
    insurance_provider: '',
    insurance_number: '',
    insurance_expiry: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const generateMRN = async () => {
    if (!clinic) return 'MRN-000001';
    
    const { data } = await supabase
      .from('patients')
      .select('medical_record_number')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const lastMRN = data[0].medical_record_number;
      const num = parseInt(lastMRN.replace('MRN-', '')) + 1;
      return `MRN-${num.toString().padStart(6, '0')}`;
    }
    return 'MRN-000001';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !user) return;

    setErrors({});
    setLoading(true);

    try {
      const result = patientSchema.safeParse(formData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      const mrn = await generateMRN();

      const { error } = await supabase.from('patients').insert({
        clinic_id: clinic.id,
        medical_record_number: mrn,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender as Gender,
        national_id: formData.national_id || null,
        phone: formData.phone,
        phone_secondary: formData.phone_secondary || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
        blood_type: (formData.blood_type as BloodType) || null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        insurance_provider: formData.insurance_provider || null,
        insurance_number: formData.insurance_number || null,
        insurance_expiry: formData.insurance_expiry || null,
        notes: formData.notes || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'تم إنشاء ملف المريض',
        description: `رقم الملف: ${mrn}`,
      });

      navigate('/patients');
    } catch (error: unknown) {
      console.error('Error creating patient:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء ملف المريض',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (clinicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-warning mb-4" />
          <h2 className="text-2xl font-bold mb-2">لم يتم ربطك بعيادة</h2>
          <p className="text-muted-foreground">يرجى التواصل مع مدير النظام</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">إضافة مريض جديد</h1>
            <p className="text-muted-foreground">أدخل بيانات المريض لإنشاء ملف طبي جديد</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">البيانات الشخصية</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">التواصل</span>
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">طبي</span>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">التأمين</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>البيانات الشخصية</CardTitle>
                  <CardDescription>المعلومات الأساسية للمريض</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">الاسم الأول *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="أدخل الاسم الأول"
                      />
                      {errors.first_name && (
                        <p className="text-sm text-destructive">{errors.first_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">اسم العائلة *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="أدخل اسم العائلة"
                      />
                      {errors.last_name && (
                        <p className="text-sm text-destructive">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">تاريخ الميلاد *</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                      {errors.date_of_birth && (
                        <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">الجنس *</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, gender: value as Gender }));
                          setErrors((prev) => ({ ...prev, gender: '' }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-destructive">{errors.gender}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="national_id">رقم الهوية</Label>
                      <Input
                        id="national_id"
                        name="national_id"
                        value={formData.national_id}
                        onChange={handleChange}
                        placeholder="رقم الهوية الوطنية"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التواصل</CardTitle>
                  <CardDescription>بيانات الاتصال بالمريض</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+966 5XXXXXXXX"
                        dir="ltr"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_secondary">هاتف إضافي</Label>
                      <Input
                        id="phone_secondary"
                        name="phone_secondary"
                        value={formData.phone_secondary}
                        onChange={handleChange}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        dir="ltr"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="العنوان التفصيلي"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">جهة الاتصال في الطوارئ</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name">الاسم</Label>
                        <Input
                          id="emergency_contact_name"
                          name="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_phone">الهاتف</Label>
                        <Input
                          id="emergency_contact_phone"
                          name="emergency_contact_phone"
                          value={formData.emergency_contact_phone}
                          onChange={handleChange}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_relation">صلة القرابة</Label>
                        <Input
                          id="emergency_contact_relation"
                          name="emergency_contact_relation"
                          value={formData.emergency_contact_relation}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical Information */}
            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الطبية</CardTitle>
                  <CardDescription>البيانات الصحية الأساسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">فصيلة الدم</Label>
                      <Select
                        value={formData.blood_type}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, blood_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفصيلة" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height_cm">الطول (سم)</Label>
                      <Input
                        id="height_cm"
                        name="height_cm"
                        type="number"
                        value={formData.height_cm}
                        onChange={handleChange}
                        placeholder="170"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight_kg">الوزن (كجم)</Label>
                      <Input
                        id="weight_kg"
                        name="weight_kg"
                        type="number"
                        value={formData.weight_kg}
                        onChange={handleChange}
                        placeholder="70"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات طبية</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="أي ملاحظات أو معلومات إضافية..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance Information */}
            <TabsContent value="insurance">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التأمين</CardTitle>
                  <CardDescription>بيانات التأمين الصحي</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_provider">شركة التأمين</Label>
                      <Input
                        id="insurance_provider"
                        name="insurance_provider"
                        value={formData.insurance_provider}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance_number">رقم البوليصة</Label>
                      <Input
                        id="insurance_number"
                        name="insurance_number"
                        value={formData.insurance_number}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance_expiry">تاريخ الانتهاء</Label>
                      <Input
                        id="insurance_expiry"
                        name="insurance_expiry"
                        type="date"
                        value={formData.insurance_expiry}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ المريض
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePatient;
