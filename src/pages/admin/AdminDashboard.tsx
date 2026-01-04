import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardStats {
  totalClinics: number;
  activeClinics: number;
  totalPatients: number;
  totalVisits: number;
  todayAppointments: number;
  pendingFollowUps: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClinics: 0,
    activeClinics: 0,
    totalPatients: 0,
    totalVisits: 0,
    todayAppointments: 0,
    pendingFollowUps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    action: string;
    table_name: string;
    created_at: string;
  }>>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch clinics count
        const { count: clinicsCount } = await supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true });

        const { count: activeClinicsCount } = await supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch patients count
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        // Fetch visits count
        const { count: visitsCount } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true });

        // Fetch today's appointments
        const today = new Date().toISOString().split('T')[0];
        const { count: appointmentsCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('appointment_date', today);

        // Fetch pending follow-ups
        const { count: followUpsCount } = await supabase
          .from('follow_ups')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalClinics: clinicsCount || 0,
          activeClinics: activeClinicsCount || 0,
          totalPatients: patientsCount || 0,
          totalVisits: visitsCount || 0,
          todayAppointments: appointmentsCount || 0,
          pendingFollowUps: followUpsCount || 0,
        });

        // Fetch recent audit logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('id, action, table_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (logs) {
          setRecentActivity(logs);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'إجمالي العيادات', value: stats.totalClinics, icon: Building2, color: 'text-primary', href: '/admin/clinics' },
    { label: 'العيادات النشطة', value: stats.activeClinics, icon: CheckCircle, color: 'text-success' },
    { label: 'إجمالي المرضى', value: stats.totalPatients, icon: Users, color: 'text-accent' },
    { label: 'إجمالي الزيارات', value: stats.totalVisits, icon: Activity, color: 'text-info' },
    { label: 'مواعيد اليوم', value: stats.todayAppointments, icon: Calendar, color: 'text-warning' },
    { label: 'متابعات معلقة', value: stats.pendingFollowUps, icon: Clock, color: 'text-destructive' },
  ];

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'إنشاء';
      case 'update': return 'تحديث';
      case 'delete': return 'حذف';
      default: return action;
    }
  };

  const getTableLabel = (table: string) => {
    switch (table) {
      case 'patients': return 'مريض';
      case 'visits': return 'زيارة';
      case 'appointments': return 'موعد';
      case 'clinics': return 'عيادة';
      default: return table;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground">نظرة عامة على النظام والإحصائيات</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/clinics/new')}>
              <Building2 className="ml-2 h-4 w-4" />
              إضافة عيادة
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => stat.href && navigate(stat.href)}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{loading ? '-' : stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                إجراءات سريعة
              </CardTitle>
              <CardDescription>الوصول السريع للوظائف الإدارية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/clinics')}>
                  <Building2 className="w-6 h-6 text-primary" />
                  <span className="text-sm">إدارة العيادات</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/users')}>
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-sm">إدارة المستخدمين</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/codes')}>
                  <Activity className="w-6 h-6 text-primary" />
                  <span className="text-sm">أكواد التسجيل</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/audit')}>
                  <AlertCircle className="w-6 h-6 text-primary" />
                  <span className="text-sm">سجل التدقيق</span>
                </Button>
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
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mb-4 opacity-50" />
                  <p>لا يوجد نشاط حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {getActionLabel(log.action)} {getTableLabel(log.table_name)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
