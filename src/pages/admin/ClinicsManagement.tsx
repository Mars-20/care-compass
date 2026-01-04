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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clinic } from '@/types/database';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Users,
  MapPin,
  Phone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ClinicsManagement = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinics((data || []) as unknown as Clinic[]);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل العيادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchClinics();
    }
  }, [isAdmin]);

  const updateClinicStatus = async (clinicId: string, status: 'active' | 'suspended' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ status })
        .eq('id', clinicId);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة العيادة بنجاح',
      });
      fetchClinics();
    } catch (error) {
      console.error('Error updating clinic:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة العيادة',
        variant: 'destructive',
      });
    }
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.registration_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">نشط</Badge>;
      case 'suspended':
        return <Badge className="bg-warning/10 text-warning border-warning/20">موقوف</Badge>;
      case 'inactive':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">غير نشط</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">إدارة العيادات</h1>
            <p className="text-muted-foreground">عرض وإدارة جميع العيادات المسجلة</p>
          </div>
          <Button onClick={() => navigate('/admin/clinics/new')}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة عيادة
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{clinics.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي العيادات</p>
                </div>
                <Building2 className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{clinics.filter(c => c.status === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">عيادات نشطة</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{clinics.filter(c => c.status === 'suspended').length}</p>
                  <p className="text-sm text-muted-foreground">عيادات موقوفة</p>
                </div>
                <Ban className="h-8 w-8 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{clinics.filter(c => c.status === 'inactive').length}</p>
                  <p className="text-sm text-muted-foreground">غير نشطة</p>
                </div>
                <Building2 className="h-8 w-8 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clinics Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>العيادات</CardTitle>
                <CardDescription>قائمة بجميع العيادات المسجلة في النظام</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن عيادة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClinics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Building2 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">لا توجد عيادات</p>
                <p className="text-sm">أضف عيادة جديدة للبدء</p>
                <Button className="mt-4" onClick={() => navigate('/admin/clinics/new')}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة عيادة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العيادة</TableHead>
                      <TableHead className="text-right">كود التسجيل</TableHead>
                      <TableHead className="text-right">التخصص</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClinics.map((clinic, index) => (
                      <motion.tr
                        key={clinic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{clinic.name}</p>
                              {clinic.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {clinic.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm">{clinic.registration_code}</code>
                        </TableCell>
                        <TableCell>{clinic.specialty}</TableCell>
                        <TableCell>
                          {clinic.city && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {clinic.city}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(clinic.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(clinic.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/clinics/${clinic.id}`)}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/admin/clinics/${clinic.id}/edit`)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              {clinic.status === 'active' ? (
                                <DropdownMenuItem onClick={() => updateClinicStatus(clinic.id, 'suspended')}>
                                  <Ban className="ml-2 h-4 w-4" />
                                  إيقاف مؤقت
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => updateClinicStatus(clinic.id, 'active')}>
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  تفعيل
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

export default ClinicsManagement;
