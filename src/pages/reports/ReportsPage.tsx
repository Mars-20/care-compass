import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Stethoscope,
  Clock,
  Download,
  Filter,
} from 'lucide-react';

interface StatsData {
  totalPatients: number;
  newPatientsThisMonth: number;
  totalVisits: number;
  visitsThisMonth: number;
  completedVisits: number;
  pendingAppointments: number;
  followUpsDue: number;
}

interface MonthlyData {
  month: string;
  visits: number;
  patients: number;
}

interface VisitTypeData {
  name: string;
  value: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--accent))'];

const ReportsPage = () => {
  const { clinic } = useClinic();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<StatsData>({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    totalVisits: 0,
    visitsThisMonth: 0,
    completedVisits: 0,
    pendingAppointments: 0,
    followUpsDue: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [visitTypeData, setVisitTypeData] = useState<VisitTypeData[]>([]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!clinic) return;

      try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        // Fetch stats
        const [
          patientsRes,
          newPatientsRes,
          visitsRes,
          monthVisitsRes,
          completedVisitsRes,
          appointmentsRes,
          followUpsRes,
          visitTypesRes,
        ] = await Promise.all([
          supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id),
          supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).gte('created_at', startOfMonth.toISOString()),
          supabase.from('visits').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id),
          supabase.from('visits').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).gte('created_at', startOfMonth.toISOString()),
          supabase.from('visits').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).eq('status', 'completed'),
          supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).eq('status', 'pending'),
          supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('clinic_id', clinic.id).in('status', ['pending', 'overdue']),
          supabase.from('visits').select('visit_type').eq('clinic_id', clinic.id),
        ]);

        setStats({
          totalPatients: patientsRes.count || 0,
          newPatientsThisMonth: newPatientsRes.count || 0,
          totalVisits: visitsRes.count || 0,
          visitsThisMonth: monthVisitsRes.count || 0,
          completedVisits: completedVisitsRes.count || 0,
          pendingAppointments: appointmentsRes.count || 0,
          followUpsDue: followUpsRes.count || 0,
        });

        // Process visit types
        if (visitTypesRes.data) {
          const typeCounts: Record<string, number> = {};
          visitTypesRes.data.forEach((v: any) => {
            const type = v.visit_type || 'other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          });

          const typeLabels: Record<string, string> = {
            new: 'زيارة جديدة',
            follow_up: 'متابعة',
            emergency: 'طوارئ',
            routine_checkup: 'فحص دوري',
            consultation: 'استشارة',
          };

          setVisitTypeData(
            Object.entries(typeCounts).map(([key, value]) => ({
              name: typeLabels[key] || key,
              value,
            }))
          );
        }

        // Generate monthly data (last 6 months)
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        const monthlyStats: MonthlyData[] = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

          const [monthVisits, monthPatients] = await Promise.all([
            supabase.from('visits').select('id', { count: 'exact', head: true })
              .eq('clinic_id', clinic.id)
              .gte('created_at', date.toISOString())
              .lte('created_at', endDate.toISOString()),
            supabase.from('patients').select('id', { count: 'exact', head: true })
              .eq('clinic_id', clinic.id)
              .gte('created_at', date.toISOString())
              .lte('created_at', endDate.toISOString()),
          ]);

          monthlyStats.push({
            month: monthNames[date.getMonth()],
            visits: monthVisits.count || 0,
            patients: monthPatients.count || 0,
          });
        }

        setMonthlyData(monthlyStats);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [clinic, period]);

  const statCards = [
    { label: 'إجمالي المرضى', value: stats.totalPatients, subValue: `+${stats.newPatientsThisMonth} هذا الشهر`, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'إجمالي الزيارات', value: stats.totalVisits, subValue: `${stats.visitsThisMonth} هذا الشهر`, icon: Stethoscope, color: 'text-success', bgColor: 'bg-success/10' },
    { label: 'زيارات مكتملة', value: stats.completedVisits, subValue: `${stats.totalVisits > 0 ? Math.round((stats.completedVisits / stats.totalVisits) * 100) : 0}%`, icon: TrendingUp, color: 'text-info', bgColor: 'bg-info/10' },
    { label: 'متابعات معلقة', value: stats.followUpsDue, subValue: 'تحتاج متابعة', icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">التقارير والإحصائيات</h1>
            <p className="text-muted-foreground">تحليل شامل لأداء العيادة</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
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
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {stat.subValue}
                      </Badge>
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Visits Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  الزيارات الشهرية
                </CardTitle>
                <CardDescription>إحصائيات آخر 6 أشهر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="الزيارات" />
                      <Bar dataKey="patients" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="المرضى الجدد" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visit Types Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-success" />
                  أنواع الزيارات
                </CardTitle>
                <CardDescription>توزيع الزيارات حسب النوع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {visitTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {visitTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>لا توجد بيانات كافية</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Growth Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                معدل النمو
              </CardTitle>
              <CardDescription>تطور أعداد المرضى والزيارات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                      name="الزيارات"
                    />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--success))' }}
                      name="المرضى الجدد"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
