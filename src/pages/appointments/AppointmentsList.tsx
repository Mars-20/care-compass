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
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Appointment, Patient } from '@/types/database';
import {
  CalendarDays,
  Search,
  Plus,
  Clock,
  User,
  Filter,
  CheckCircle,
  XCircle,
  Phone,
  MoreHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentWithPatient extends Appointment {
  patients: Patient;
}

const AppointmentsList = () => {
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New appointment form
  const [newAppDialog, setNewAppDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [reason, setReason] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!clinic) return;

      try {
        // Fetch appointments for selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        let query = supabase
          .from('appointments')
          .select('*, patients(*)')
          .eq('clinic_id', clinic.id)
          .gte('appointment_date', startOfDay.toISOString().split('T')[0])
          .lte('appointment_date', endOfDay.toISOString().split('T')[0])
          .order('appointment_time', { ascending: true });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show');
        }

        const { data, error } = await query;

        if (error) throw error;
        setAppointments((data || []) as unknown as AppointmentWithPatient[]);

        // Fetch patients for new appointment
        const { data: patientsData } = await supabase
          .from('patients')
          .select('*')
          .eq('clinic_id', clinic.id)
          .eq('is_active', true)
          .order('first_name');

        setPatients((patientsData || []) as unknown as Patient[]);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل المواعيد',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clinic, selectedDate, statusFilter, toast]);

  const filteredAppointments = appointments.filter((app) => {
    const patientName = `${app.patients.first_name} ${app.patients.last_name}`.toLowerCase();
    return patientName.includes(searchTerm.toLowerCase());
  });

  const filteredPatients = patients.filter((patient) => {
    const searchLower = patientSearch.toLowerCase();
    return (
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchLower) ||
      patient.phone.includes(patientSearch)
    );
  });

  const handleCreateAppointment = async () => {
    if (!clinic || !selectedPatient || !appointmentDate || !appointmentTime) {
      toast({
        title: 'خطأ',
        description: 'يرجى تعبئة جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('appointments').insert({
        clinic_id: clinic.id,
        patient_id: selectedPatient,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_type: appointmentType,
        reason: reason || null,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'تم',
        description: 'تم إنشاء الموعد بنجاح',
      });

      setNewAppDialog(false);
      setSelectedPatient('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReason('');
      
      // Refetch appointments
      setSelectedDate(new Date(appointmentDate));
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء الموعد',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show') => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(
        appointments.map((app) =>
          app.id === appointmentId ? { ...app, status: newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' } : app
        )
      );

      toast({
        title: 'تم',
        description: 'تم تحديث حالة الموعد',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success">مؤكد</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning">معلق</Badge>;
      case 'completed':
        return <Badge className="bg-info/10 text-info">مكتمل</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive">ملغي</Badge>;
      case 'no_show':
        return <Badge className="bg-muted text-muted-foreground">لم يحضر</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      new: 'زيارة جديدة',
      follow_up: 'متابعة',
      consultation: 'استشارة',
      procedure: 'إجراء',
      checkup: 'فحص دوري',
    };
    return types[type] || type;
  };

  // Time slots for appointments
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
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
            <h1 className="text-2xl font-bold text-foreground">المواعيد</h1>
            <p className="text-muted-foreground">إدارة مواعيد المرضى</p>
          </div>
          <Dialog open={newAppDialog} onOpenChange={setNewAppDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                موعد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>إنشاء موعد جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label>المريض *</Label>
                  <Input
                    placeholder="بحث بالاسم أو رقم الهاتف..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                  {patientSearch && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg">
                      {filteredPatients.slice(0, 5).map((patient) => (
                        <div
                          key={patient.id}
                          className={`p-2 cursor-pointer hover:bg-muted ${
                            selectedPatient === patient.id ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => {
                            setSelectedPatient(patient.id);
                            setPatientSearch(`${patient.first_name} ${patient.last_name}`);
                          }}
                        >
                          <p className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{patient.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوقت *</Label>
                    <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوقت" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>نوع الموعد</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">استشارة</SelectItem>
                      <SelectItem value="follow_up">متابعة</SelectItem>
                      <SelectItem value="checkup">فحص دوري</SelectItem>
                      <SelectItem value="procedure">إجراء</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>السبب</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="سبب الموعد (اختياري)"
                  />
                </div>

                <Button onClick={handleCreateAppointment} className="w-full">
                  إنشاء الموعد
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                التقويم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ar}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث بالاسم..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="ml-2 h-4 w-4" />
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">معلقة</SelectItem>
                      <SelectItem value="confirmed">مؤكدة</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                      <SelectItem value="cancelled">ملغاة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Date Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {format(selectedDate, 'EEEE، d MMMM yyyy', { locale: ar })}
              </h2>
              <Badge variant="outline">{filteredAppointments.length} موعد</Badge>
            </div>

            {/* Appointments */}
            <Card>
              <CardContent className="pt-6">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">لا توجد مواعيد لهذا اليوم</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((appointment, index) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        {/* Time */}
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold text-primary">
                            {appointment.appointment_time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.duration_minutes} دقيقة
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-12 bg-border"></div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </p>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.patients.phone}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getAppointmentTypeLabel(appointment.appointment_type)}
                            </Badge>
                          </div>
                          {appointment.reason && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {appointment.reason}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                              >
                                <CheckCircle className="ml-2 h-4 w-4 text-success" />
                                تأكيد الموعد
                              </DropdownMenuItem>
                            )}
                            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/visits/new?patient=${appointment.patient_id}`)}
                                >
                                  <User className="ml-2 h-4 w-4" />
                                  بدء الزيارة
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                >
                                  <CheckCircle className="ml-2 h-4 w-4" />
                                  إنهاء
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(appointment.id, 'no_show')}
                                >
                                  <XCircle className="ml-2 h-4 w-4 text-warning" />
                                  لم يحضر
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                  className="text-destructive"
                                >
                                  <XCircle className="ml-2 h-4 w-4" />
                                  إلغاء
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => navigate(`/patients/${appointment.patient_id}`)}
                            >
                              <User className="ml-2 h-4 w-4" />
                              ملف المريض
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsList;
