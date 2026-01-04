import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuditLog } from '@/types/database';
import {
  Activity,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuditLogs = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter as 'create' | 'update' | 'delete' | 'read');
      }

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as unknown as AuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل سجلات التدقيق',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin, actionFilter, tableFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="w-4 h-4" />;
      case 'update':
        return <Pencil className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'read':
        return <Eye className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge className="bg-success/10 text-success border-success/20">إنشاء</Badge>;
      case 'update':
        return <Badge className="bg-warning/10 text-warning border-warning/20">تحديث</Badge>;
      case 'delete':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">حذف</Badge>;
      case 'read':
        return <Badge className="bg-info/10 text-info border-info/20">قراءة</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableLabel = (table: string) => {
    const labels: Record<string, string> = {
      patients: 'المرضى',
      visits: 'الزيارات',
      appointments: 'المواعيد',
      clinics: 'العيادات',
      diagnoses: 'التشخيصات',
      prescriptions: 'الوصفات',
      follow_ups: 'المتابعات',
    };
    return labels[table] || table;
  };

  const filteredLogs = logs.filter((log) =>
    log.table_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">سجل التدقيق</h1>
            <p className="text-muted-foreground">تتبع جميع العمليات في النظام</p>
          </div>
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="نوع العملية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العمليات</SelectItem>
                  <SelectItem value="create">إنشاء</SelectItem>
                  <SelectItem value="update">تحديث</SelectItem>
                  <SelectItem value="delete">حذف</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="الجدول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الجداول</SelectItem>
                  <SelectItem value="patients">المرضى</SelectItem>
                  <SelectItem value="visits">الزيارات</SelectItem>
                  <SelectItem value="appointments">المواعيد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              سجل العمليات
            </CardTitle>
            <CardDescription>آخر 100 عملية في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">لا توجد سجلات</p>
                <p className="text-sm">ستظهر هنا جميع العمليات في النظام</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العملية</TableHead>
                      <TableHead className="text-right">الجدول</TableHead>
                      <TableHead className="text-right">التاريخ والوقت</TableHead>
                      <TableHead className="text-right">المعرف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              {getActionIcon(log.action)}
                            </div>
                            {getActionBadge(log.action)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTableLabel(log.table_name)}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(log.created_at).toLocaleString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs px-2 py-1 bg-muted rounded">
                            {log.record_id?.slice(0, 8)}...
                          </code>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
