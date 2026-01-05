import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClinic } from '@/hooks/useClinic';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowUp, Patient } from '@/types/database';
import {
  Clock,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Phone,
  Eye,
  Play,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowUpWithPatient extends FollowUp {
  patients: Patient;
}

const FollowUpsList = () => {
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [followUps, setFollowUps] = useState<FollowUpWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!clinic) return;

      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .select('*, patients(*)')
          .eq('clinic_id', clinic.id)
          .order('follow_up_date', { ascending: true });

        if (error) throw error;
        setFollowUps((data || []) as unknown as FollowUpWithPatient[]);
      } catch (error) {
        console.error('Error fetching follow-ups:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل المتابعات',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [clinic, toast]);

  // Update overdue follow-ups
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueFollowUps = followUps.filter(
      (f) => f.status === 'pending' && new Date(f.follow_up_date) < today
    );

    if (overdueFollowUps.length > 0) {
      const updateOverdue = async () => {
        for (const followUp of overdueFollowUps) {
          await supabase
            .from('follow_ups')
            .update({ status: 'overdue' })
            .eq('id', followUp.id);
        }
        // Refetch
        setFollowUps(
          followUps.map((f) =>
            overdueFollowUps.some((o) => o.id === f.id)
              ? { ...f, status: 'overdue' as any }
              : f
          )
        );
      };
      updateOverdue();
    }
  }, [followUps]);

  const handleCompleteFollowUp = async (followUpId: string, patientId: string) => {
    try {
      await supabase
        .from('follow_ups')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', followUpId);

      setFollowUps(
        followUps.map((f) =>
          f.id === followUpId
            ? { ...f, status: 'completed' as any, completed_at: new Date().toISOString() }
            : f
        )
      );

      toast({
        title: 'تم',
        description: 'تم إكمال المتابعة',
      });
    } catch (error) {
      console.error('Error completing follow-up:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث المتابعة',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning/10 text-warning">معلق</Badge>;
      case 'completed':
        return <Badge className="bg-success/10 text-success">مكتمل</Badge>;
      case 'overdue':
        return <Badge className="bg-destructive/10 text-destructive">متأخر</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground">ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(date);
    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const overdueFollowUps = followUps.filter((f) => f.status === 'overdue');
  const completedFollowUps = followUps.filter((f) => f.status === 'completed');

  // Today's follow-ups
  const today = new Date().toISOString().split('T')[0];
  const todayFollowUps = followUps.filter(
    (f) => f.follow_up_date === today && f.status !== 'completed'
  );

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">المتابعات الطبية</h1>
          <p className="text-muted-foreground">إدارة مواعيد متابعة المرضى</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingFollowUps.length}</p>
                  <p className="text-sm text-muted-foreground">معلقة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueFollowUps.length}</p>
                  <p className="text-sm text-muted-foreground">متأخرة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayFollowUps.length}</p>
                  <p className="text-sm text-muted-foreground">اليوم</p>
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
                  <p className="text-2xl font-bold">{completedFollowUps.length}</p>
                  <p className="text-sm text-muted-foreground">مكتملة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Alert */}
        {todayFollowUps.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Calendar className="h-5 w-5" />
                متابعات اليوم ({todayFollowUps.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayFollowUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">
                          {followUp.patients.first_name.charAt(0)}
                          {followUp.patients.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {followUp.patients.first_name} {followUp.patients.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{followUp.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/visits/new?patient=${followUp.patient_id}`)}
                      >
                        <Play className="ml-1 h-4 w-4" />
                        زيارة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteFollowUp(followUp.id, followUp.patient_id)}
                      >
                        <CheckCircle className="ml-1 h-4 w-4" />
                        إكمال
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              المعلقة ({pendingFollowUps.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              المتأخرة ({overdueFollowUps.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              المكتملة ({completedFollowUps.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <FollowUpList
              followUps={pendingFollowUps}
              onComplete={handleCompleteFollowUp}
              navigate={navigate}
              getStatusBadge={getStatusBadge}
              getDaysUntil={getDaysUntil}
            />
          </TabsContent>

          <TabsContent value="overdue">
            <FollowUpList
              followUps={overdueFollowUps}
              onComplete={handleCompleteFollowUp}
              navigate={navigate}
              getStatusBadge={getStatusBadge}
              getDaysUntil={getDaysUntil}
            />
          </TabsContent>

          <TabsContent value="completed">
            <FollowUpList
              followUps={completedFollowUps}
              navigate={navigate}
              getStatusBadge={getStatusBadge}
              getDaysUntil={getDaysUntil}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

interface FollowUpListProps {
  followUps: FollowUpWithPatient[];
  onComplete?: (id: string, patientId: string) => void;
  navigate: (path: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getDaysUntil: (date: string) => number;
}

const FollowUpList = ({
  followUps,
  onComplete,
  navigate,
  getStatusBadge,
  getDaysUntil,
}: FollowUpListProps) => {
  if (followUps.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">لا توجد متابعات</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {followUps.map((followUp, index) => {
            const daysUntil = getDaysUntil(followUp.follow_up_date);

            return (
              <motion.div
                key={followUp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary">
                    {followUp.patients.first_name.charAt(0)}
                    {followUp.patients.last_name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">
                      {followUp.patients.first_name} {followUp.patients.last_name}
                    </p>
                    {getStatusBadge(followUp.status)}
                    {followUp.status !== 'completed' && (
                      <Badge
                        variant={daysUntil < 0 ? 'destructive' : daysUntil === 0 ? 'default' : 'outline'}
                      >
                        {daysUntil < 0
                          ? `متأخر ${Math.abs(daysUntil)} يوم`
                          : daysUntil === 0
                          ? 'اليوم'
                          : `بعد ${daysUntil} يوم`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{followUp.reason}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(followUp.follow_up_date).toLocaleDateString('ar-SA')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {followUp.patients.phone}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {followUp.status !== 'completed' && onComplete && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/visits/new?patient=${followUp.patient_id}`)}
                      >
                        <Play className="ml-1 h-4 w-4" />
                        زيارة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onComplete(followUp.id, followUp.patient_id)}
                      >
                        <CheckCircle className="ml-1 h-4 w-4" />
                        إكمال
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/patients/${followUp.patient_id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpsList;
