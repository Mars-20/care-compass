import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Visit, Patient } from '@/types/database';
import {
  Stethoscope,
  Search,
  Plus,
  Calendar,
  User,
  Clock,
  Filter,
  Eye,
  Play,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisitWithPatient extends Visit {
  patients: Patient;
}

const VisitsList = () => {
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [visits, setVisits] = useState<VisitWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  useEffect(() => {
    const fetchVisits = async () => {
      if (!clinic) return;

      try {
        let query = supabase
          .from('visits')
          .select('*, patients(*)')
          .eq('clinic_id', clinic.id)
          .order('visit_date', { ascending: false });

        // Apply date filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query = query
            .gte('visit_date', today.toISOString())
            .lt('visit_date', tomorrow.toISOString());
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          query = query.gte('visit_date', weekAgo.toISOString());
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          query = query.gte('visit_date', monthAgo.toISOString());
        }

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show');
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;
        setVisits((data || []) as unknown as VisitWithPatient[]);
      } catch (error) {
        console.error('Error fetching visits:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل الزيارات',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [clinic, statusFilter, dateFilter, toast]);

  const filteredVisits = visits.filter((visit) => {
    const patientName = `${visit.patients.first_name} ${visit.patients.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      patientName.includes(searchLower) ||
      visit.visit_number.toLowerCase().includes(searchLower) ||
      visit.patients.medical_record_number.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success">مكتمل</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning/10 text-warning">جارية</Badge>;
      case 'scheduled':
        return <Badge className="bg-info/10 text-info">مجدولة</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive">ملغاة</Badge>;
      case 'no_show':
        return <Badge className="bg-muted text-muted-foreground">لم يحضر</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVisitTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      new: 'زيارة جديدة',
      follow_up: 'متابعة',
      emergency: 'طوارئ',
      routine_checkup: 'فحص دوري',
      consultation: 'استشارة',
    };
    return types[type] || type;
  };

  const handleStartVisit = async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', visitId);

      if (error) throw error;

      toast({
        title: 'تم',
        description: 'تم بدء الزيارة',
      });

      navigate(`/visits/${visitId}`);
    } catch (error) {
      console.error('Error starting visit:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في بدء الزيارة',
        variant: 'destructive',
      });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الزيارات الطبية</h1>
            <p className="text-muted-foreground">إدارة زيارات المرضى والفحوصات</p>
          </div>
          <Button onClick={() => navigate('/visits/new')}>
            <Plus className="ml-2 h-4 w-4" />
            زيارة جديدة
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو رقم الزيارة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Calendar className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="all">الكل</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="scheduled">مجدولة</SelectItem>
                  <SelectItem value="in_progress">جارية</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {visits.filter((v) => v.status === 'scheduled').length}
                  </p>
                  <p className="text-sm text-muted-foreground">مجدولة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Play className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {visits.filter((v) => v.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-muted-foreground">جارية</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {visits.filter((v) => v.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">مكتملة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{visits.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              قائمة الزيارات ({filteredVisits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredVisits.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">لا توجد زيارات</p>
                <Button className="mt-4" onClick={() => navigate('/visits/new')}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة زيارة جديدة
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVisits.map((visit, index) => (
                  <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-bold text-primary">
                        {visit.patients.first_name.charAt(0)}
                        {visit.patients.last_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground">
                          {visit.patients.first_name} {visit.patients.last_name}
                        </p>
                        {getStatusBadge(visit.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(visit.visit_date).toLocaleDateString('ar-SA')}
                        </span>
                        <span>#{visit.visit_number}</span>
                        <Badge variant="outline" className="text-xs">
                          {getVisitTypeLabel(visit.visit_type)}
                        </Badge>
                      </div>
                      {visit.chief_complaint && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {visit.chief_complaint}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {visit.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartVisit(visit.id)}
                        >
                          <Play className="ml-1 h-4 w-4" />
                          بدء
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/visits/${visit.id}`)}
                      >
                        <Eye className="ml-1 h-4 w-4" />
                        عرض
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VisitsList;
