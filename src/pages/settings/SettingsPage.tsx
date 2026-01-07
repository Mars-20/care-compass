import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { user, profile, isAdmin } = useAuth();
  const { clinic, refetch } = useClinic();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  // Clinic form
  const [clinicForm, setClinicForm] = useState({
    name: clinic?.name || '',
    name_en: clinic?.name_en || '',
    specialty: clinic?.specialty || '',
    description: clinic?.description || '',
    phone: clinic?.phone || '',
    email: clinic?.email || '',
    website: clinic?.website || '',
    address: clinic?.address || '',
    city: clinic?.city || '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    appointments: true,
    followUps: true,
    reports: false,
    marketing: false,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث الملف الشخصي بنجاح',
      });
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

  const handleSaveClinic = async () => {
    if (!clinic) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinicForm.name,
          name_en: clinicForm.name_en || null,
          specialty: clinicForm.specialty,
          description: clinicForm.description || null,
          phone: clinicForm.phone || null,
          email: clinicForm.email || null,
          website: clinicForm.website || null,
          address: clinicForm.address || null,
          city: clinicForm.city || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clinic.id);

      if (error) throw error;

      refetch();
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث بيانات العيادة بنجاح',
      });
    } catch (error) {
      console.error('Error saving clinic:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التغييرات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة الإعدادات الشخصية وإعدادات العيادة</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              الملف الشخصي
            </TabsTrigger>
            {!isAdmin && (
              <TabsTrigger value="clinic" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                العيادة
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    الملف الشخصي
                  </CardTitle>
                  <CardDescription>
                    تعديل معلوماتك الشخصية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {profileForm.full_name?.charAt(0) || user?.email?.charAt(0) || 'م'}
                      </span>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">تغيير الصورة</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG بحد أقصى 2MB</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>الاسم الكامل</Label>
                      <Input
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input value={user?.email || ''} disabled />
                      <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+966 5X XXX XXXX"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      <Save className="ml-2 h-4 w-4" />
                      {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Clinic Settings */}
          {!isAdmin && (
            <TabsContent value="clinic">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      إعدادات العيادة
                    </CardTitle>
                    <CardDescription>
                      تعديل معلومات العيادة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>اسم العيادة (عربي) *</Label>
                        <Input
                          value={clinicForm.name}
                          onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                          placeholder="اسم العيادة"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>اسم العيادة (إنجليزي)</Label>
                        <Input
                          value={clinicForm.name_en}
                          onChange={(e) => setClinicForm({ ...clinicForm, name_en: e.target.value })}
                          placeholder="Clinic Name"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>التخصص *</Label>
                        <Input
                          value={clinicForm.specialty}
                          onChange={(e) => setClinicForm({ ...clinicForm, specialty: e.target.value })}
                          placeholder="طب عام، أسنان، عيون..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الهاتف</Label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={clinicForm.phone}
                            onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                            placeholder="+966 XX XXX XXXX"
                            className="pr-10"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>البريد الإلكتروني</Label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={clinicForm.email}
                            onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                            placeholder="clinic@example.com"
                            className="pr-10"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>الموقع الإلكتروني</Label>
                        <div className="relative">
                          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={clinicForm.website}
                            onChange={(e) => setClinicForm({ ...clinicForm, website: e.target.value })}
                            placeholder="https://clinic.com"
                            className="pr-10"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>المدينة</Label>
                        <div className="relative">
                          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={clinicForm.city}
                            onChange={(e) => setClinicForm({ ...clinicForm, city: e.target.value })}
                            placeholder="الرياض"
                            className="pr-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>العنوان</Label>
                        <Input
                          value={clinicForm.address}
                          onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                          placeholder="العنوان التفصيلي"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Textarea
                        value={clinicForm.description}
                        onChange={(e) => setClinicForm({ ...clinicForm, description: e.target.value })}
                        placeholder="وصف مختصر عن العيادة..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveClinic} disabled={saving}>
                        <Save className="ml-2 h-4 w-4" />
                        {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    إعدادات الإشعارات
                  </CardTitle>
                  <CardDescription>
                    تحكم في الإشعارات التي تتلقاها
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">إشعارات المواعيد</p>
                        <p className="text-sm text-muted-foreground">تلقي تنبيهات للمواعيد القادمة</p>
                      </div>
                      <Switch
                        checked={notifications.appointments}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, appointments: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">تذكير المتابعات</p>
                        <p className="text-sm text-muted-foreground">تنبيهات للمتابعات المعلقة والمتأخرة</p>
                      </div>
                      <Switch
                        checked={notifications.followUps}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, followUps: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">تقارير أسبوعية</p>
                        <p className="text-sm text-muted-foreground">ملخص أسبوعي بالإحصائيات</p>
                      </div>
                      <Switch
                        checked={notifications.reports}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    الأمان والخصوصية
                  </CardTitle>
                  <CardDescription>
                    إعدادات الأمان وكلمة المرور
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">تغيير كلمة المرور</p>
                        <p className="text-sm text-muted-foreground">تحديث كلمة المرور الخاصة بك</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>كلمة المرور الحالية</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label>كلمة المرور الجديدة</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label>تأكيد كلمة المرور</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <Button>تحديث كلمة المرور</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">جلسات تسجيل الدخول</h3>
                    <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">الجلسة الحالية</p>
                        <p className="text-sm text-muted-foreground">
                          {navigator.userAgent.includes('Mobile') ? 'هاتف محمول' : 'متصفح ويب'}
                        </p>
                      </div>
                      <Badge className="bg-success/10 text-success">نشط</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
