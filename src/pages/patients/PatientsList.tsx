import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
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
import { Patient } from '@/types/database';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Phone,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PatientsList = () => {
  const { user, loading: authLoading } = useAuth();
  const { clinic, loading: clinicLoading } = useClinic();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchPatients = async () => {
    if (!clinic) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients((data || []) as unknown as Patient[]);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل قائمة المرضى',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinic) {
      fetchPatients();
    } else if (!clinicLoading) {
      setLoading(false);
    }
  }, [clinic, clinicLoading]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.medical_record_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (authLoading || clinicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-warning mb-4" />
          <h2 className="text-2xl font-bold mb-2">لم يتم ربطك بعيادة</h2>
          <p className="text-muted-foreground mb-4">يرجى التواصل مع مدير النظام لربطك بعيادة</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">المرضى</h1>
            <p className="text-muted-foreground">إدارة سجلات المرضى في العيادة</p>
          </div>
          <Button onClick={() => navigate('/patients/new')}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة مريض
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي المرضى</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {patients.filter((p) => p.gender === 'male').length}
                  </p>
                  <p className="text-sm text-muted-foreground">ذكور</p>
                </div>
                <User className="h-8 w-8 text-info opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {patients.filter((p) => p.gender === 'female').length}
                  </p>
                  <p className="text-sm text-muted-foreground">إناث</p>
                </div>
                <User className="h-8 w-8 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {
                      patients.filter((p) => {
                        const created = new Date(p.created_at);
                        const now = new Date();
                        return (
                          created.getMonth() === now.getMonth() &&
                          created.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">هذا الشهر</p>
                </div>
                <Calendar className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>قائمة المرضى</CardTitle>
                <CardDescription>جميع المرضى المسجلين في العيادة</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن مريض..."
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
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">لا يوجد مرضى</p>
                <p className="text-sm">أضف مريض جديد للبدء</p>
                <Button className="mt-4" onClick={() => navigate('/patients/new')}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة مريض
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المريض</TableHead>
                      <TableHead className="text-right">رقم الملف</TableHead>
                      <TableHead className="text-right">العمر / الجنس</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">تاريخ التسجيل</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {patient.first_name.charAt(0)}
                                {patient.last_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {patient.first_name} {patient.last_name}
                              </p>
                              {patient.blood_type && (
                                <Badge variant="outline" className="text-xs">
                                  {patient.blood_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {patient.medical_record_number}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {calculateAge(patient.date_of_birth)} سنة
                            <span className="text-muted-foreground mr-1">
                              ({patient.gender === 'male' ? 'ذكر' : 'أنثى'})
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {patient.phone}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(patient.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}`)}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض الملف
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                                <Edit className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/visits/new?patient=${patient.id}`)}>
                                <FileText className="ml-2 h-4 w-4" />
                                زيارة جديدة
                              </DropdownMenuItem>
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

export default PatientsList;
