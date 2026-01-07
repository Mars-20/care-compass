import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Stethoscope,
  Clock,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  CalendarPlus,
  FileText,
  Activity,
  ChevronLeft,
} from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  monthlyVisits: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
}

interface RecentActivity {
  id: string;
  type: 'visit' | 'appointment' | 'patient';
  patient_name: string;
  description: string;
  time: string;
}

interface TodayAppointment {
  id: string;
  time: string;
  patient_name: string;
  type: string;
  status: string;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { clinic } = useClinic();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyVisits: 0,
    pendingFollowUps: 0,
    overdueFollowUps: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!clinic) return;

      try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

        // Fetch stats in parallel
        const [patientsRes, appointmentsRes, visitsRes, followUpsRes, todayAppRes] = await Promise.all([
          supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).eq('is_active', true),
          supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).eq('appointment_date', todayStr),
          supabase.from('visits').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).gte('created_at', startOfMonth),
          supabase.from('follow_ups').select('id, status', { count: 'exact' }).eq('clinic_id', clinic.id).in('status', ['pending', 'overdue']),
          supabase.from('appointments').select('id, appointment_time, appointment_type, status, patients(first_name, last_name)').eq('clinic_id', clinic.id).eq('appointment_date', todayStr).order('appointment_time').limit(5),
        ]);

        const pendingCount = followUpsRes.data?.filter(f => f.status === 'pending').length || 0;
        const overdueCount = followUpsRes.data?.filter(f => f.status === 'overdue').length || 0;

        setStats({
          totalPatients: patientsRes.count || 0,
          todayAppointments: appointmentsRes.count || 0,
          monthlyVisits: visitsRes.count || 0,
          pendingFollowUps: pendingCount,
          overdueFollowUps: overdueCount,
        });

        // Format today's appointments
        if (todayAppRes.data) {
          setTodayAppointments(
            todayAppRes.data.map((app: any) => ({
              id: app.id,
              time: app.appointment_time,
              patient_name: `${app.patients?.first_name || ''} ${app.patients?.last_name || ''}`,
              type: app.appointment_type,
              status: app.status,
            }))
          );
        }

        // Fetch recent activity
        const { data: recentVisits } = await supabase
          .from('visits')
          .select('id, visit_date, visit_type, patients(first_name, last_name)')
          .eq('clinic_id', clinic.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentVisits) {
          setRecentActivity(
            recentVisits.map((visit: any) => ({
              id: visit.id,
              type: 'visit' as const,
              patient_name: `${visit.patients?.first_name || ''} ${visit.patients?.last_name || ''}`,
              description: getVisitTypeLabel(visit.visit_type),
              time: new Date(visit.visit_date).toLocaleDateString('ar-SA'),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [clinic]);

  const getVisitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      new: 'زيارة جديدة',
      follow_up: 'متابعة',
      emergency: 'طوارئ',
      routine_checkup: 'فحص دوري',
      consultation: 'استشارة',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success">مؤكد</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning">معلق</Badge>;
      case 'completed':
        return <Badge className="bg-info/10 text-info">مكتمل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      new: 'جديدة',
      follow_up: 'متابعة',
      consultation: 'استشارة',
      procedure: 'إجراء',
      checkup: 'فحص',
    };
    return types[type] || type;
  };

  const statCards = [
    { label: 'إجمالي المرضى', value: stats.totalPatients, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'مواعيد اليوم', value: stats.todayAppointments, icon: Calendar, color: 'text-info', bgColor: 'bg-info/10' },
    { label: 'زيارات الشهر', value: stats.monthlyVisits, icon: Stethoscope, color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'متابعات معلقة', value: stats.pendingFollowUps, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
  ];

  const quickActions = [
    { label: 'مريض جديد', icon: UserPlus, href: '/patients/new', color: 'text-primary' },
    { label: 'موعد جديد', icon: CalendarPlus, href: '/appointments', color: 'text-info' },
    { label: 'زيارة جديدة', icon: Stethoscope, href: '/visits/new', color: 'text-success' },
    { label: 'التقارير', icon: FileText, href: '/reports', color: 'text-accent' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              مرحباً، {profile?.full_name || 'دكتور'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {stats.overdueFollowUps > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg"
            >
              <AlertTriangle className="h-5 w-5" />
              <span>{stats.overdueFollowUps} متابعات متأخرة</span>
              <Button size="sm" variant="ghost" onClick={() => navigate('/follow-ups')}>
                عرض
              </Button>
            </motion.div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {stat.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    onClick={() => navigate(action.href)}
                  >
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-info" />
                  مواعيد اليوم
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
                  عرض الكل
                  <ChevronLeft className="mr-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مواعيد اليوم</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate('/appointments')}
                    >
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold text-primary">{app.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{app.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{getAppointmentTypeLabel(app.type)}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                النشاط الأخير
              </CardTitle>
              <CardDescription>آخر الزيارات والعمليات</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>لا يوجد نشاط حديث</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/visits/${activity.id}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clinic Info Card */}
        {clinic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{clinic.name}</h3>
                    <p className="text-muted-foreground">{clinic.specialty}</p>
                    {clinic.city && <p className="text-sm text-muted-foreground">{clinic.city}</p>}
                  </div>
                  <Button variant="outline" onClick={() => navigate('/settings')}>
                    إعدادات العيادة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
