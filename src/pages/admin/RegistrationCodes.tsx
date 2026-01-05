import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RegistrationCode, Clinic } from '@/types/database';
import {
  Key,
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RegistrationCodes = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);

  // Form
  const [codeType, setCodeType] = useState<'clinic' | 'doctor'>('doctor');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [codesRes, clinicsRes] = await Promise.all([
          supabase
            .from('registration_codes')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase.from('clinics').select('*').eq('status', 'active'),
        ]);

        if (codesRes.error) throw codesRes.error;
        setCodes((codesRes.data || []) as unknown as RegistrationCode[]);
        setClinics((clinicsRes.data || []) as unknown as Clinic[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل البيانات',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCreateCode = async () => {
    if (!user) return;

    if (codeType === 'doctor' && !selectedClinic) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار العيادة',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate code
      const { data: generatedCode } = await supabase.rpc('generate_registration_code');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      const { data, error } = await supabase
        .from('registration_codes')
        .insert({
          code: generatedCode,
          type: codeType,
          clinic_id: codeType === 'doctor' ? selectedClinic : null,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCodes([data as unknown as RegistrationCode, ...codes]);
      setCreateDialog(false);
      setCodeType('doctor');
      setSelectedClinic('');

      toast({
        title: 'تم إنشاء الكود',
        description: `الكود: ${generatedCode}`,
      });
    } catch (error) {
      console.error('Error creating code:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الكود',
        variant: 'destructive',
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ الكود إلى الحافظة',
    });
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('registration_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      setCodes(codes.filter((c) => c.id !== codeId));
      toast({
        title: 'تم',
        description: 'تم حذف الكود',
      });
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الكود',
        variant: 'destructive',
      });
    }
  };

  const getClinicName = (clinicId: string | null) => {
    if (!clinicId) return '-';
    const clinic = clinics.find((c) => c.id === clinicId);
    return clinic?.name || '-';
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
            <h1 className="text-2xl font-bold text-foreground">أكواد التسجيل</h1>
            <p className="text-muted-foreground">إدارة أكواد تسجيل العيادات والأطباء</p>
          </div>
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إنشاء كود جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء كود تسجيل جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع الكود</Label>
                  <Select
                    value={codeType}
                    onValueChange={(value: 'clinic' | 'doctor') => setCodeType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic">عيادة جديدة</SelectItem>
                      <SelectItem value="doctor">طبيب (انضمام لعيادة)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {codeType === 'doctor' && (
                  <div className="space-y-2">
                    <Label>العيادة</Label>
                    <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العيادة" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>صلاحية الكود (أيام)</Label>
                  <Select value={expiryDays} onValueChange={setExpiryDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">يوم واحد</SelectItem>
                      <SelectItem value="3">3 أيام</SelectItem>
                      <SelectItem value="7">أسبوع</SelectItem>
                      <SelectItem value="14">أسبوعين</SelectItem>
                      <SelectItem value="30">شهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateCode} className="w-full">
                  إنشاء الكود
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{codes.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي</p>
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
                    {codes.filter((c) => !c.is_used && !isExpired(c.expires_at)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">صالحة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{codes.filter((c) => c.is_used).length}</p>
                  <p className="text-sm text-muted-foreground">مستخدمة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {codes.filter((c) => !c.is_used && isExpired(c.expires_at)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">منتهية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Codes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              قائمة الأكواد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {codes.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">لا توجد أكواد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {codes.map((code, index) => {
                  const expired = isExpired(code.expires_at);

                  return (
                    <motion.div
                      key={code.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        code.is_used
                          ? 'bg-muted/30'
                          : expired
                          ? 'bg-destructive/5'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {code.type === 'clinic' ? (
                          <Building2 className="h-6 w-6 text-primary" />
                        ) : (
                          <User className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="font-mono text-lg font-bold tracking-wider">
                            {code.code}
                          </code>
                          {code.is_used ? (
                            <Badge className="bg-info/10 text-info">مستخدم</Badge>
                          ) : expired ? (
                            <Badge className="bg-destructive/10 text-destructive">منتهي</Badge>
                          ) : (
                            <Badge className="bg-success/10 text-success">صالح</Badge>
                          )}
                          <Badge variant="outline">
                            {code.type === 'clinic' ? 'عيادة' : 'طبيب'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {code.clinic_id && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {getClinicName(code.clinic_id)}
                            </span>
                          )}
                          {code.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              ينتهي: {new Date(code.expires_at).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {!code.is_used && !expired && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCode(code.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RegistrationCodes;
