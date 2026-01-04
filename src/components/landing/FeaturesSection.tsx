import { 
  Users, 
  FileText, 
  Calendar, 
  Bell, 
  Shield, 
  Activity,
  ClipboardList,
  Share2
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "إدارة المرضى",
    description: "سجل شامل لكل مريض يتضمن البيانات الشخصية، التاريخ المرضي، والحساسيات الدوائية.",
    color: "primary",
  },
  {
    icon: FileText,
    title: "السجل الطبي الطولي",
    description: "تتبع كامل لتطور حالة المريض عبر الزمن مع كل زيارة، تشخيص، وعلاج.",
    color: "accent",
  },
  {
    icon: Calendar,
    title: "إدارة المواعيد",
    description: "نظام حجز ذكي يدير المواعيد ويتتبع الحضور والغياب تلقائياً.",
    color: "success",
  },
  {
    icon: Bell,
    title: "تنبيهات المتابعة",
    description: "تذكيرات آلية لمتابعة المرضى وضمان استمرارية الرعاية الصحية.",
    color: "warning",
  },
  {
    icon: ClipboardList,
    title: "شاشة الكشف الطبي",
    description: "واجهة سهلة للطبيب لتسجيل التشخيص والعلاج وتحديث حالة المريض.",
    color: "info",
  },
  {
    icon: Share2,
    title: "نظام الإحالات",
    description: "إحالة سلسة للمرضى بين الأطباء مع الحفاظ على السجل الكامل.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "أمان وخصوصية",
    description: "تشفير كامل للبيانات مع سجل تدقيق لكل وصول أو تعديل.",
    color: "accent",
  },
  {
    icon: Activity,
    title: "تقارير وإحصائيات",
    description: "لوحة تحكم شاملة بإحصائيات العيادة والأداء اليومي.",
    color: "success",
  },
];

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" dir="rtl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Activity className="w-4 h-4" />
            <span>مميزات المنصة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            كل ما تحتاجه لإدارة
            <span className="text-gradient"> عيادتك بنجاح</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            منصة متكاملة تجمع كل أدوات إدارة العيادات في مكان واحد، مصممة خصيصاً لتلبية احتياجات الأطباء والطاقم الطبي.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-large transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                dir="rtl"
              >
                <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
