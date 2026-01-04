import { Mail, Phone, MapPin } from "lucide-react";
import logoLight from "@/assets/logo-light.png";

const footerLinks = {
  product: {
    title: "المنتج",
    links: [
      { label: "المميزات", href: "#features" },
      { label: "كيف يعمل", href: "#how-it-works" },
      { label: "الأسعار", href: "#pricing" },
      { label: "الأسئلة الشائعة", href: "#faq" },
    ],
  },
  company: {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "#about" },
      { label: "المدونة", href: "#blog" },
      { label: "الوظائف", href: "#careers" },
      { label: "تواصل معنا", href: "#contact" },
    ],
  },
  legal: {
    title: "قانوني",
    links: [
      { label: "سياسة الخصوصية", href: "#privacy" },
      { label: "شروط الاستخدام", href: "#terms" },
      { label: "اتفاقية الخدمة", href: "#sla" },
    ],
  },
};

export function FooterSection() {
  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12" dir="rtl">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-auto flex items-center justify-center rounded-xl bg-primary p-2">
                <img
                  src={logoLight}
                  alt="Marktology"
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-background/70 mb-6 max-w-sm leading-relaxed">
              منصة Marktology هي شريكك الطبي الموثوق لإدارة العيادات وبناء سجلات طبية رقمية احترافية.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:support@marktology.com"
                className="flex items-center gap-3 text-background/70 hover:text-accent transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>support@marktology.com</span>
              </a>
              <a
                href="tel:+201234567890"
                className="flex items-center gap-3 text-background/70 hover:text-accent transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span dir="ltr">+20 123 456 7890</span>
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-4 h-4" />
                <span>القاهرة، مصر</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-background mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-background/70 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4" dir="rtl">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} Marktology. جميع الحقوق محفوظة.
            </p>
            <p className="text-sm text-background/60">
              صُنع بـ ❤️ لمقدمي الرعاية الصحية
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
