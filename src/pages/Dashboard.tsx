import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import logoLight from '@/assets/logo-light.png';
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  User,
  Activity,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile, role, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    { label: 'المرضى', value: '0', icon: Users, color: 'text-primary' },
    { label: 'المواعيد اليوم', value: '0', icon: Calendar, color: 'text-accent' },
    { label: 'الزيارات هذا الشهر', value: '0', icon: Activity, color: 'text-success' },
    { label: 'التقارير', value: '0', icon: FileText, color: 'text-info' },
  ];

  const quickActions = [
    { label: 'إضافة مريض جديد', icon: Users, href: '/patients/new' },
    { label: 'جدولة موعد', icon: Calendar, href: '/appointments/new' },
    { label: 'السجلات الطبية', icon: FileText, href: '/records' },
    { label: 'الإعدادات', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src={logoLight} alt="Marktology" className="h-8" />
              <div className="hidden sm:block">
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm font-medium text-foreground mr-2">لوحة التحكم</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                <Shield className="w-4 h-4" />
                <span>{isAdmin ? 'مدير النظام' : 'طبيب'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {profile?.full_name || 'مستخدم'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              مرحباً، {profile?.full_name || 'مستخدم'}
            </h1>
            <p className="text-muted-foreground">
              <Clock className="inline-block w-4 h-4 ml-1" />
              {new Date().toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  إجراءات سريعة
                </CardTitle>
                <CardDescription>الوصول السريع للوظائف الأساسية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
                      onClick={() => navigate(action.href)}
                    >
                      <action.icon className="w-6 h-6 text-primary" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  النشاط الأخير
                </CardTitle>
                <CardDescription>آخر العمليات في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mb-4 opacity-50" />
                  <p>لا يوجد نشاط حتى الآن</p>
                  <p className="text-sm">ستظهر هنا آخر العمليات</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Shield className="w-5 h-5" />
                    لوحة تحكم المدير
                  </CardTitle>
                  <CardDescription>أدوات إدارية متقدمة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-auto py-3">
                      <Users className="w-4 h-4 ml-2" />
                      إدارة المستخدمين
                    </Button>
                    <Button variant="outline" className="h-auto py-3">
                      <Settings className="w-4 h-4 ml-2" />
                      إعدادات العيادة
                    </Button>
                    <Button variant="outline" className="h-auto py-3">
                      <FileText className="w-4 h-4 ml-2" />
                      التقارير
                    </Button>
                    <Button variant="outline" className="h-auto py-3">
                      <Activity className="w-4 h-4 ml-2" />
                      سجل التدقيق
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
