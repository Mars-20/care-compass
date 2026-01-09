import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, KeyRound, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function JoinClinic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clinicName, setClinicName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال كود الانضمام',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Check if user already belongs to a clinic
      const { data: existingStaff } = await supabase
        .from('clinic_staff')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingStaff) {
        toast({
          title: 'تنبيه',
          description: 'أنت مسجل بالفعل في عيادة',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Find the registration code
      const { data: regCode, error: codeError } = await supabase
        .from('registration_codes')
        .select('*, clinics(*)')
        .eq('code', code.toUpperCase().trim())
        .eq('is_used', false)
        .eq('type', 'doctor')
        .maybeSingle();

      if (codeError || !regCode) {
        toast({
          title: 'كود غير صالح',
          description: 'الكود غير موجود أو تم استخدامه مسبقاً',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Check if code is expired
      if (regCode.expires_at && new Date(regCode.expires_at) < new Date()) {
        toast({
          title: 'كود منتهي الصلاحية',
          description: 'انتهت صلاحية هذا الكود',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (!regCode.clinic_id) {
        toast({
          title: 'خطأ',
          description: 'هذا الكود غير مرتبط بعيادة',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Add user to clinic_staff
      const { error: staffError } = await supabase
        .from('clinic_staff')
        .insert({
          clinic_id: regCode.clinic_id,
          user_id: user.id,
          role: 'doctor',
          invitation_code: code.toUpperCase().trim(),
          is_active: true,
        });

      if (staffError) {
        console.error('Staff insert error:', staffError);
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء الانضمام للعيادة',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Mark the code as used
      await supabase
        .from('registration_codes')
        .update({
          is_used: true,
          used_by: user.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', regCode.id);

      // Get clinic name for success message
      const clinic = regCode.clinics as { name: string } | null;
      setClinicName(clinic?.name || 'العيادة');
      setSuccess(true);

      toast({
        title: 'تم بنجاح!',
        description: `تم انضمامك إلى ${clinic?.name || 'العيادة'}`,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Join clinic error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-10 pb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">تم الانضمام بنجاح!</h2>
              <p className="text-muted-foreground mb-6">
                مرحباً بك في {clinicName}
              </p>
              <p className="text-sm text-muted-foreground">
                جاري توجيهك للوحة التحكم...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">الانضمام لعيادة</CardTitle>
            <CardDescription>
              أدخل كود الانضمام الذي حصلت عليه من مدير العيادة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="أدخل كود الانضمام"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="pr-10 text-center text-lg tracking-widest font-mono uppercase"
                    maxLength={10}
                    disabled={loading}
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  الكود مكون من 8 أحرف وأرقام
                </p>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading || !code.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    انضم الآن
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-3">
                ليس لديك كود انضمام؟
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                الذهاب للوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
