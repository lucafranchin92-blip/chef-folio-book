import { Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="font-serif text-2xl text-foreground tracking-wide">
              <span className="text-primary">Chef</span> Laurent
            </a>
            <p className="text-muted-foreground font-sans text-sm mt-4 leading-relaxed">
              Creating unforgettable culinary experiences for private events across the tri-state area.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-sans text-sm tracking-wider uppercase mb-4">Contact</h4>
            <div className="space-y-3">
              <a href="mailto:chef@laurentdubois.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-sans text-sm">
                <Mail className="w-4 h-4" />
                chef@laurentdubois.com
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-sans text-sm">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-sans text-sm">
                <Instagram className="w-4 h-4" />
                @cheflaurent
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-foreground font-sans text-sm tracking-wider uppercase mb-4">Availability</h4>
            <div className="text-muted-foreground font-sans text-sm space-y-2">
              <p>Private Events: By Appointment</p>
              <p>Consultation: Mon-Fri, 10am-6pm</p>
              <p>Advance Booking: 2-4 weeks recommended</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-sans text-xs">
            © {new Date().getFullYear()} Chef Laurent Dubois. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-sans text-xs">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-sans text-xs">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
