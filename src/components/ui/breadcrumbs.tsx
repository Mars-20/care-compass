import { ChevronLeft, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "لوحة التحكم",
  patients: "المرضى",
  visits: "الزيارات",
  appointments: "المواعيد",
  "follow-ups": "المتابعات",
  reports: "التقارير",
  settings: "الإعدادات",
  profile: "الملف الشخصي",
  admin: "الإدارة",
  clinics: "العيادات",
  users: "المستخدمين",
  "audit-logs": "سجل النشاط",
  "registration-codes": "أكواد التسجيل",
  "admin-settings": "إعدادات النظام",
  create: "إنشاء",
  edit: "تعديل",
  new: "جديد",
  "join-clinic": "الانضمام لعيادة",
  notifications: "الإشعارات",
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip UUID-like segments
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        return;
      }

      const label = routeLabels[segment] || segment;
      const isLast = index === pathSegments.length - 1;

      generatedItems.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return generatedItems;
  })();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center gap-1">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronLeft className="w-4 h-4 mx-1" />
            {item.href ? (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
