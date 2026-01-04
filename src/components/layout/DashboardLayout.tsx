import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinic';
import { Button } from '@/components/ui/button';
import logoLight from '@/assets/logo-light.png';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  User,
  Shield,
  Building2,
  ClipboardList,
  Activity,
  Bell,
  Menu,
  X,
  ChevronDown,
  Stethoscope,
  Clock,
  UserPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { clinic } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const adminNavItems = [
    { label: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { label: 'العيادات', href: '/admin/clinics', icon: Building2 },
    { label: 'المستخدمون', href: '/admin/users', icon: Users },
    { label: 'أكواد التسجيل', href: '/admin/codes', icon: ClipboardList },
    { label: 'سجل التدقيق', href: '/admin/audit', icon: Activity },
    { label: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ];

  const doctorNavItems = [
    { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
    { label: 'المرضى', href: '/patients', icon: Users },
    { label: 'المواعيد', href: '/appointments', icon: Calendar },
    { label: 'الزيارات', href: '/visits', icon: Stethoscope },
    { label: 'المتابعات', href: '/follow-ups', icon: Clock },
    { label: 'التقارير', href: '/reports', icon: FileText },
    { label: 'الإعدادات', href: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : doctorNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-l border-border px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary p-1.5">
              <img src={logoLight} alt="Marktology" className="h-full w-auto" />
            </div>
            <div>
              <span className="font-bold text-foreground">Marktology</span>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'لوحة المدير' : clinic?.name || 'العيادة'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick Actions */}
            {!isAdmin && (
              <div className="mt-auto pt-4 border-t border-border">
                <Button
                  className="w-full justify-start gap-2"
                  onClick={() => navigate('/patients/new')}
                >
                  <UserPlus className="h-4 w-4" />
                  إضافة مريض جديد
                </Button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border lg:hidden"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary p-1">
                    <img src={logoLight} alt="Marktology" className="h-full w-auto" />
                  </div>
                  <span className="font-bold text-foreground">Marktology</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col gap-y-2 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pr-72">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search or Breadcrumb can go here */}
            <div className="flex flex-1 items-center">
              {clinic && !isAdmin && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{clinic.name}</span>
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Role Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                <Shield className="w-4 h-4" />
                <span>{isAdmin ? 'مدير النظام' : 'طبيب'}</span>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium">{profile?.full_name || 'مستخدم'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="ml-2 h-4 w-4" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
