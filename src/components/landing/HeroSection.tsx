import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Shield, Users, Calendar } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden bg-gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft delay-300" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-float" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Content */}
          <div className="order-2 lg:order-1 text-center lg:text-right" dir="rtl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span>منصة طبية موثوقة ومعتمدة</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
              إدارة عيادتك
              <span className="block text-gradient mt-2">بذكاء واحترافية</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up delay-100">
              منصة Marktology الشاملة لإدارة العيادات الطبية، السجلات الصحية، المواعيد، والمتابعة المستمرة للمرضى بأعلى معايير الأمان والجودة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up delay-200">
              <Button variant="hero" size="xl">
                <span>ابدأ تجربتك المجانية</span>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" className="group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>شاهد العرض التوضيحي</span>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50 animate-slide-up delay-300">
              <div className="text-center lg:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-primary">+500</div>
                <div className="text-sm text-muted-foreground">عيادة مسجلة</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-primary">+50K</div>
                <div className="text-sm text-muted-foreground">مريض مسجل</div>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">وقت التشغيل</div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="order-1 lg:order-2 flex justify-center animate-scale-in">
            <div className="relative w-full max-w-lg">
              {/* Main Card */}
              <div className="bg-card rounded-2xl shadow-xl p-6 border border-border/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div dir="rtl">
                    <h3 className="font-semibold text-foreground">لوحة تحكم الطبيب</h3>
                    <p className="text-sm text-muted-foreground">إدارة كاملة للمرضى</p>
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">أح</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">أحمد محمد</div>
                        <div className="text-xs text-muted-foreground">فحص دوري</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">مكتمل</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-accent">سا</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">سارة علي</div>
                        <div className="text-xs text-muted-foreground">متابعة علاج</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-full">قيد الانتظار</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">مح</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">محمد خالد</div>
                        <div className="text-xs text-muted-foreground">استشارة جديدة</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-info/10 text-info rounded-full">جديد</span>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-large p-4 border border-border/50 animate-float">
                <div className="flex items-center gap-3" dir="rtl">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">12 موعد اليوم</div>
                    <div className="text-xs text-muted-foreground">3 في الانتظار</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
