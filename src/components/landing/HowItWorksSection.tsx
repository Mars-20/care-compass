import { Building2, UserPlus, Stethoscope, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "سجّل عيادتك",
    description: "أنشئ ملفاً رقمياً لعيادتك بالبيانات الأساسية والتخصص وفعّل حسابك برمز التسجيل الفريد.",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "أضف مرضاك",
    description: "سجّل بيانات المرضى بشكل شامل مع التاريخ المرضي والحساسيات لبناء سجل طبي موثوق.",
  },
  {
    number: "03",
    icon: Stethoscope,
    title: "ابدأ الكشف",
    description: "استخدم شاشة الكشف لتسجيل التشخيص والعلاج وتحديث حالة المريض في كل زيارة.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "تابع وطوّر",
    description: "راقب تطور حالات مرضاك، احصل على تنبيهات المتابعة، وحسّن جودة الرعاية.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" dir="rtl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Stethoscope className="w-4 h-4" />
            <span>كيف يعمل النظام</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            أربع خطوات نحو
            <span className="text-gradient"> عيادة رقمية متكاملة</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            ابدأ رحلتك مع Marktology بخطوات بسيطة وسريعة لتحويل عيادتك إلى منظومة رقمية احترافية.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                dir="rtl"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-0 w-full h-px bg-gradient-to-l from-primary/20 to-transparent" />
                )}
                
                <div className="relative bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-large transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-primary text-primary-foreground text-xs font-bold rounded-full">
                    {step.number}
                  </div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
