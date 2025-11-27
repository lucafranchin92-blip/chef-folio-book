import { Button } from "./ui/button";
import chefPortrait from "@/assets/chef-portrait.jpg";

const HeroSection = () => {
  const scrollToReservation = () => {
    const element = document.getElementById("reservation");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-burgundy/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <p className="text-primary font-sans text-sm tracking-[0.3em] uppercase mb-4">
              Private Chef Experience
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight mb-6">
              Culinary
              <span className="block gradient-text">Excellence</span>
              At Your Table
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-lg mx-auto lg:mx-0 font-sans leading-relaxed">
              Transform your special occasions into unforgettable gastronomic journeys with personalized fine dining experiences in the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="gold" size="xl" onClick={scrollToReservation}>
                Reserve Your Experience
              </Button>
              <Button variant="goldOutline" size="xl" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>
                View Menu
              </Button>
            </div>
          </div>

          {/* Chef Portrait */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Gold accent frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-2xl" />
              <div className="absolute -top-2 -left-2 w-24 h-24 border-l-2 border-t-2 border-primary" />
              <div className="absolute -bottom-2 -right-2 w-24 h-24 border-r-2 border-b-2 border-primary" />
              
              <img
                src={chefPortrait}
                alt="Chef Laurent - Private Chef"
                className="relative w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Experience badge */}
            <div className="absolute -bottom-4 -left-4 lg:bottom-8 lg:-left-8 bg-card border border-border p-4 rounded-lg shadow-xl">
              <p className="text-primary font-serif text-3xl font-bold">15+</p>
              <p className="text-muted-foreground font-sans text-xs tracking-wider uppercase">Years Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
