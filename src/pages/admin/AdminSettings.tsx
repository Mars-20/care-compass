import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Shield,
  Bell,
  Database,
  Globe,
  Lock,
  Key,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    allowNewRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    auditLogAlerts: true,
    weeklyReports: false,
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ الإعدادات بنجاح',
    });
    
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات النظام</h1>
          <p className="text-muted-foreground">إدارة إعدادات المنصة والأمان</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              عام
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              النظام
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    الإعدادات العامة
                  </CardTitle>
                  <CardDescription>إعدادات المنصة الأساسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اسم المنصة</Label>
                      <Input value="Marktology" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>اللغة الافتراضية</Label>
                      <Input value="العربية" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>المنطقة الزمنية</Label>
                      <Input value="Asia/Riyadh (GMT+3)" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>تنسيق التاريخ</Label>
                      <Input value="DD/MM/YYYY" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>التسجيل والحسابات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">السماح بالتسجيلات الجديدة</p>
                      <p className="text-sm text-muted-foreground">السماح للمستخدمين بإنشاء حسابات جديدة</p>
                    </div>
                    <Switch
                      checked={systemSettings.allowNewRegistrations}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allowNewRegistrations: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">تأكيد البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">طلب تأكيد البريد عند التسجيل</p>
                    </div>
                    <Switch
                      checked={systemSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, requireEmailVerification: checked })}
                    />
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
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    إعدادات الأمان
                  </CardTitle>
                  <CardDescription>تكوين سياسات الأمان</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>مهلة الجلسة (دقيقة)</Label>
                      <Input
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">إنهاء الجلسة تلقائياً بعد فترة عدم النشاط</p>
                    </div>
                    <div className="space-y-2">
                      <Label>محاولات تسجيل الدخول المسموحة</Label>
                      <Input
                        type="number"
                        value={systemSettings.maxLoginAttempts}
                        onChange={(e) => setSystemSettings({ ...systemSettings, maxLoginAttempts: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">عدد المحاولات قبل إيقاف الحساب مؤقتاً</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      سياسات كلمة المرور
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">الحد الأدنى للأحرف</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">تتطلب أحرف خاصة</p>
                        <p className="text-2xl font-bold">نعم</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    منطقة الخطر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
                      <p className="font-medium">إعادة تعيين جميع الجلسات</p>
                      <p className="text-sm text-muted-foreground mb-3">سيتم تسجيل خروج جميع المستخدمين</p>
                      <Button variant="outline" className="border-warning text-warning hover:bg-warning/10">
                        إعادة تعيين الجلسات
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

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
                  <CardDescription>تكوين إشعارات النظام</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">إشعارات البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">إرسال إشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">تنبيهات النظام</p>
                      <p className="text-sm text-muted-foreground">تنبيهات الأخطاء والمشاكل التقنية</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">تنبيهات سجل التدقيق</p>
                      <p className="text-sm text-muted-foreground">إشعارات للأنشطة الحساسة</p>
                    </div>
                    <Switch
                      checked={notificationSettings.auditLogAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, auditLogAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">التقارير الأسبوعية</p>
                      <p className="text-sm text-muted-foreground">ملخص أسبوعي بالإحصائيات</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    معلومات النظام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">إصدار النظام</p>
                      <p className="text-xl font-bold">1.0.0</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">قاعدة البيانات</p>
                      <p className="text-xl font-bold">Supabase PostgreSQL</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">آخر تحديث</p>
                      <p className="text-xl font-bold">{new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">حالة النظام</p>
                      <p className="text-xl font-bold text-success">يعمل بشكل طبيعي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الصيانة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">تنظيف ذاكرة التخزين المؤقت</p>
                      <p className="text-sm text-muted-foreground">إزالة البيانات المؤقتة القديمة</p>
                    </div>
                    <Button variant="outline">تنظيف</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">نسخ احتياطي</p>
                      <p className="text-sm text-muted-foreground">آخر نسخة: منذ 24 ساعة</p>
                    </div>
                    <Button variant="outline">إنشاء نسخة</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ جميع التغييرات'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
