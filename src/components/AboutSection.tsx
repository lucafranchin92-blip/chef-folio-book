import { Award, Users, Utensils, Clock } from "lucide-react";

const stats = [
  { icon: Award, value: "3", label: "Michelin Stars" },
  { icon: Users, value: "500+", label: "Private Events" },
  { icon: Utensils, value: "25+", label: "Signature Dishes" },
  { icon: Clock, value: "15+", label: "Years Experience" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div>
            <p className="text-primary font-sans text-sm tracking-[0.3em] uppercase mb-4">
              The Story
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              A Passion for
              <span className="block text-primary">Exceptional Cuisine</span>
            </h2>
            <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
              <p>
                With over 15 years of experience in Michelin-starred kitchens across Europe, 
                Chef Laurent brings world-class culinary expertise directly to your table.
              </p>
              <p>
                Trained at Le Cordon Bleu Paris and mentored by legendary chefs in France, 
                Italy, and Japan, every dish is a harmonious blend of classical techniques 
                and modern innovation.
              </p>
              <p>
                My philosophy is simple: source the finest seasonal ingredients, respect 
                their natural flavors, and create dishes that tell a story and evoke emotion.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="font-serif text-2xl italic text-foreground">Chef Laurent Dubois</p>
              <p className="text-muted-foreground font-sans text-sm mt-1">Executive Private Chef</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card border border-border p-8 rounded-lg text-center hover:border-primary/50 transition-all duration-300 group"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-4xl font-serif text-foreground mb-2">{stat.value}</p>
                <p className="text-muted-foreground font-sans text-sm tracking-wider uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
