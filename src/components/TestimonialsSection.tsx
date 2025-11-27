import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Victoria Sterling",
    role: "Anniversary Dinner",
    content: "Chef Laurent transformed our 25th anniversary into an unforgettable evening. The attention to detail, from the personalized menu to the impeccable presentation, was simply extraordinary.",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "Corporate Event",
    content: "We've hosted many corporate dinners, but none have received the praise that Chef Laurent's service garnered. Our clients were thoroughly impressed with every course.",
    rating: 5,
  },
  {
    name: "Isabella Rodriguez",
    role: "Birthday Celebration",
    content: "The tasting menu created for my mother's 70th birthday was a journey through flavors we'll never forget. Chef Laurent's passion for his craft is evident in every bite.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 relative">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-primary font-sans text-sm tracking-[0.3em] uppercase mb-4">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl font-serif mb-4">
            What Guests <span className="text-primary">Say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 rounded-lg relative group hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-muted-foreground font-sans leading-relaxed mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              <div className="border-t border-border pt-4">
                <p className="font-serif text-foreground text-lg">{testimonial.name}</p>
                <p className="text-primary font-sans text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
