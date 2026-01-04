import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

const benefits = [
  "تجربة مجانية لمدة 14 يوم",
  "بدون بطاقة ائتمان",
  "دعم فني مستمر",
  "تدريب مجاني للفريق",
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-primary" />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E\")" }} />
      
      {/* Decorations */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center" dir="rtl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-primary-foreground text-sm font-medium mb-6 animate-fade-in backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>ابدأ رحلتك الآن</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 animate-slide-up">
            انضم لمئات العيادات التي
            <span className="block mt-2 opacity-90">تثق في Marktology</span>
          </h2>

          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 animate-slide-up delay-100">
            حوّل عيادتك إلى منظومة رقمية متكاملة تدير السجلات الطبية، المواعيد، والمتابعات بكفاءة عالية وأمان تام.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-slide-up delay-200">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm text-primary-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl"
            >
              <span>ابدأ تجربتك المجانية</span>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="hero-outline"
              size="xl"
            >
              <span>تحدث مع فريق المبيعات</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
