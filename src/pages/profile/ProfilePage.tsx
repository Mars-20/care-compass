import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Building2,
  Edit,
  Save,
  X,
  Stethoscope,
  Users,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileStats {
  totalPatients: number;
  totalVisits: number;
  thisMonthVisits: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, role, isAdmin } = useAuth();
  const { clinic, clinicStaff } = useClinic();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalPatients: 0,
    totalVisits: 0,
    thisMonthVisits: 0,
  });

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!clinic || isAdmin) return;

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      const [patientsRes, visitsRes, monthVisitsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).gte('created_at', startOfMonth),
      ]);

      setStats({
        totalPatients: patientsRes.count || 0,
        totalVisits: visitsRes.count || 0,
        thisMonthVisits: monthVisitsRes.count || 0,
      });
    };

    fetchStats();
  }, [clinic, isAdmin]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث الملف الشخصي بنجاح',
      });
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التغييرات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return <Badge className="bg-destructive/10 text-destructive">مدير النظام</Badge>;
    }
    return <Badge className="bg-primary/10 text-primary">طبيب</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الملف الشخصي</h1>
            <p className="text-muted-foreground">عرض وتعديل معلوماتك الشخصية</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="ml-2 h-4 w-4" />
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {form.full_name?.charAt(0) || user?.email?.charAt(0) || 'م'}
                    </span>
                  </div>
                  {getRoleBadge()}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>الاسم الكامل</Label>
                        <Input
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الهاتف</Label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+966 5X XXX XXXX"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">الاسم</p>
                          <p className="font-medium">{profile?.full_name || 'غير محدد'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                          <p className="font-medium" dir="ltr">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                          <p className="font-medium" dir="ltr">{profile?.phone || 'غير محدد'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                          <p className="font-medium">غير محدد</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clinic Info */}
        {!isAdmin && clinic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  العيادة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{clinic.name}</h3>
                    <p className="text-muted-foreground">{clinic.specialty}</p>
                    {clinic.city && <p className="text-sm text-muted-foreground">{clinic.city}</p>}
                  </div>
                  <Badge variant={clinic.status === 'active' ? 'default' : 'secondary'}>
                    {clinic.status === 'active' ? 'نشطة' : 'غير نشطة'}
                  </Badge>
                </div>

                {clinicStaff && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      انضممت في {new Date(clinicStaff.joined_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>الإحصائيات</CardTitle>
                <CardDescription>ملخص نشاطك في المنصة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalPatients}</p>
                    <p className="text-sm text-muted-foreground">المرضى</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                      <Stethoscope className="h-5 w-5 text-success" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalVisits}</p>
                    <p className="text-sm text-muted-foreground">إجمالي الزيارات</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-5 w-5 text-info" />
                    </div>
                    <p className="text-2xl font-bold">{stats.thisMonthVisits}</p>
                    <p className="text-sm text-muted-foreground">زيارات الشهر</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
