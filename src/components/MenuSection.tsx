import dish1 from "@/assets/dish-1.jpg";
import dish2 from "@/assets/dish-2.jpg";
import dish3 from "@/assets/dish-3.jpg";

const dishes = [
  {
    image: dish1,
    name: "Foie Gras Torchon",
    description: "Sauternes gelée, brioche, fig compote",
    category: "Appetizer",
  },
  {
    image: dish2,
    name: "Seared Hokkaido Scallops",
    description: "Cauliflower purée, golden raisins, caper brown butter",
    category: "Main Course",
  },
  {
    image: dish3,
    name: "Chocolate Fondant",
    description: "Salted caramel, hazelnut praline, vanilla bean ice cream",
    category: "Dessert",
  },
];

const MenuSection = () => {
  return (
    <section id="menu" className="py-24 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-sans text-sm tracking-[0.3em] uppercase mb-4">
            Signature Creations
          </p>
          <h2 className="text-4xl md:text-5xl font-serif mb-4">
            A Taste of <span className="text-primary">Excellence</span>
          </h2>
          <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
            Each dish is crafted with precision, passion, and the finest seasonal ingredients 
            to create an unforgettable dining experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-500"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-primary font-sans text-xs tracking-[0.2em] uppercase mb-2">
                  {dish.category}
                </p>
                <h3 className="text-foreground font-serif text-xl mb-2">{dish.name}</h3>
                <p className="text-muted-foreground font-sans text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {dish.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground font-sans text-sm">
            Menu tailored to your preferences, dietary requirements, and seasonal availability.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
