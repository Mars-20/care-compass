import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, UserPlus, Stethoscope, Clock, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SkeletonList } from '@/components/ui/skeleton-card';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  appointment: <Calendar className="w-5 h-5" />,
  patient: <UserPlus className="w-5 h-5" />,
  visit: <Stethoscope className="w-5 h-5" />,
  follow_up: <Clock className="w-5 h-5" />,
  default: <Bell className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  patient: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  visit: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  follow_up: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  default: 'bg-muted text-muted-foreground',
};

export default function NotificationsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({ title: 'خطأ', description: 'فشل في تحميل الإشعارات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast({ title: 'تم تحديد الكل كمقروء' });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({ title: 'تم حذف الإشعار' });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      setNotifications(prev => prev.filter(n => !n.is_read));
      toast({ title: 'تم حذف الإشعارات المقروءة' });
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.related_id && notification.related_type) {
      switch (notification.related_type) {
        case 'appointment':
          navigate(`/appointments`);
          break;
        case 'visit':
          navigate(`/visits/${notification.related_id}`);
          break;
        case 'patient':
          navigate(`/patients/${notification.related_id}`);
          break;
        case 'follow_up':
          navigate(`/follow-ups`);
          break;
      }
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = format(new Date(notification.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'اليوم';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'أمس';
    } else {
      return format(date, 'EEEE، d MMMM yyyy', { locale: ar });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6" />
              الإشعارات
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 ml-2" />
                قراءة الكل
              </Button>
            )}
            {notifications.filter(n => n.is_read).length > 0 && (
              <Button variant="outline" onClick={deleteAllRead}>
                <Trash2 className="w-4 h-4 ml-2" />
                حذف المقروءة
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <SkeletonList items={5} />
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3>
              <p className="text-muted-foreground">ستظهر الإشعارات هنا عند وصولها</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {formatDateHeader(date)}
                </h3>
                <Card>
                  <CardContent className="p-0 divide-y">
                    {dateNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          !notification.is_read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div
                          className={`p-3 rounded-full ${
                            typeColors[notification.type] || typeColors.default
                          }`}
                        >
                          {typeIcons[notification.type] || typeIcons.default}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              {notification.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ar,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.is_read && (
                                <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
