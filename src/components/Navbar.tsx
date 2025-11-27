import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="font-serif text-2xl text-foreground tracking-wide">
            <span className="text-primary">Chef</span> Laurent
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("about")}
              className="text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wider uppercase"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("menu")}
              className="text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wider uppercase"
            >
              Menu
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wider uppercase"
            >
              Reviews
            </button>
            <Button
              variant="gold"
              size="default"
              onClick={() => scrollToSection("reservation")}
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("about")}
                className="text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wider uppercase text-left"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("menu")}
                className="text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wider uppercase text-left"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-muted-foreground hover:text-primary transition-colors font-sans text-sm tracking-wider uppercase text-left"
              >
                Reviews
              </button>
              <Button
                variant="gold"
                size="default"
                onClick={() => scrollToSection("reservation")}
                className="w-full"
              >
                Book Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
