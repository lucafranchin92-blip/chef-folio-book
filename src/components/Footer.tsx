import { ChefHat } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="font-serif text-lg text-foreground">
              Private<span className="text-primary">Chef</span>
            </span>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">
              We Accept
            </span>
            <div className="flex items-center gap-3">
              {/* Google Pay */}
              <div className="flex items-center justify-center h-8 px-3 bg-background rounded-md border border-border">
                <span className="text-xs font-semibold tracking-tight">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC04]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                  <span className="text-muted-foreground ml-1">Pay</span>
                </span>
              </div>

              {/* Apple Pay */}
              <div className="flex items-center justify-center h-8 px-3 bg-background rounded-md border border-border">
                <span className="text-xs font-semibold text-foreground tracking-tight">
                  <span className="mr-0.5"></span> Pay
                </span>
              </div>

              {/* PayPal */}
              <div className="flex items-center justify-center h-8 px-3 bg-background rounded-md border border-border">
                <span className="text-xs font-bold tracking-tight">
                  <span className="text-[#003087]">Pay</span>
                  <span className="text-[#009cde]">Pal</span>
                </span>
              </div>

              {/* Stripe */}
              <div className="flex items-center justify-center h-8 px-3 bg-background rounded-md border border-border">
                <span className="text-xs font-bold text-[#635BFF] tracking-tight">stripe</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} PrivateChef. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
