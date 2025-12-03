import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Calendar, Users, ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { chefs } from "@/data/chefs";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { bookingFormSchema } from "@/lib/validations";

const eventTypes = [
  "Intimate Dinner",
  "Anniversary",
  "Birthday",
  "Corporate Event",
  "Wedding",
  "Holiday Gathering",
];

const extractPrice = (priceRange: string): number => {
  const match = priceRange.match(/\d+/);
  return match ? parseInt(match[0]) : 200;
};

type FormErrors = Record<string, string>;

const ChefProfile = () => {
  const { id } = useParams();
  const chef = chefs.find((c) => c.id === id);
  const { addItem } = useCart();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "",
    eventType: "",
    location: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  if (!chef) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Chef not found</p>
          <Link to="/">
            <Button variant="gold">Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const result = bookingFormSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reservation Request Sent!",
      description: `Your request to book ${chef.name} has been submitted. You'll hear back within 24 hours.`,
    });
    setFormData({
      date: "",
      time: "",
      guests: "",
      eventType: "",
      location: "",
      message: "",
    });
    setErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddToCart = () => {
    // Validate required fields for cart addition
    const cartValidation = bookingFormSchema.safeParse({
      ...formData,
      // Allow empty message for cart
      message: formData.message || "",
    });

    if (!cartValidation.success) {
      const newErrors: FormErrors = {};
      cartValidation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        // Skip message field errors for cart
        if (field !== "message") {
          newErrors[field] = err.message;
        }
      });
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast({
          title: "Missing Information",
          description: "Please fill in the required fields before adding to cart.",
          variant: "destructive",
        });
        return;
      }
    }

    addItem({
      chef,
      serviceType: formData.eventType || "Private Dining",
      date: formData.date || new Date().toISOString().split('T')[0],
      guests: parseInt(formData.guests) || 4,
      price: extractPrice(chef.priceRange),
    });
    toast({
      title: "Added to Cart",
      description: `${chef.name} has been added to your cart.`,
    });
  };

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {message}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-serif text-lg">Chef Profile</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chef Info */}
          <div>
            {/* Profile Header */}
            <div className="flex gap-4 mb-6">
              <img
                src={chef.image}
                alt={chef.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{chef.name}</h2>
                    <p className="text-primary font-sans">{chef.specialty}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {chef.priceRange}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="text-foreground font-sans">{chef.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({chef.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground text-sm font-sans mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {chef.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {chef.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Cuisines */}
            <div className="flex gap-2 flex-wrap mb-6">
              {chef.cuisines.map((cuisine) => (
                <Badge key={cuisine} variant="outline">
                  {cuisine}
                </Badge>
              ))}
            </div>

            {/* About */}
            <div className="mb-6">
              <h3 className="font-serif text-lg text-foreground mb-2">About</h3>
              <p className="text-muted-foreground font-sans leading-relaxed">
                {chef.description}
              </p>
            </div>

            {/* Availability Status */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    chef.available ? "bg-green-500" : "bg-muted-foreground"
                  }`}
                />
                <span className="font-sans text-sm">
                  {chef.available
                    ? "Available for bookings"
                    : "Currently unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-serif text-xl text-foreground mb-6">
              Request a Booking
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-sans text-sm mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Date
                  </label>
                  <Input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={!chef.available}
                    className={`bg-secondary border-border ${errors.date ? "border-destructive" : ""}`}
                  />
                  <ErrorMessage message={errors.date} />
                </div>
                <div>
                  <label className="block text-muted-foreground font-sans text-sm mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Time
                  </label>
                  <Input
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={!chef.available}
                    className={`bg-secondary border-border ${errors.time ? "border-destructive" : ""}`}
                  />
                  <ErrorMessage message={errors.time} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-sans text-sm mb-2">
                    <Users className="inline w-4 h-4 mr-1" />
                    Guests
                  </label>
                  <Input
                    name="guests"
                    type="number"
                    min="2"
                    max="50"
                    placeholder="2-50"
                    value={formData.guests}
                    onChange={handleChange}
                    disabled={!chef.available}
                    className={`bg-secondary border-border ${errors.guests ? "border-destructive" : ""}`}
                  />
                  <ErrorMessage message={errors.guests} />
                </div>
                <div>
                  <label className="block text-muted-foreground font-sans text-sm mb-2">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    disabled={!chef.available}
                    className={`w-full h-10 px-3 rounded-md bg-secondary border text-foreground font-sans text-sm ${
                      errors.eventType ? "border-destructive" : "border-border"
                    }`}
                  >
                    <option value="">Select type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage message={errors.eventType} />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Event Location
                </label>
                <Input
                  name="location"
                  placeholder="City or address"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!chef.available}
                  className={`bg-secondary border-border ${errors.location ? "border-destructive" : ""}`}
                  maxLength={200}
                />
                <ErrorMessage message={errors.location} />
              </div>

              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">
                  Special Requests
                </label>
                <Textarea
                  name="message"
                  placeholder="Dietary restrictions, preferences, or special requests..."
                  value={formData.message}
                  onChange={handleChange}
                  disabled={!chef.available}
                  rows={3}
                  className="bg-secondary border-border resize-none"
                  maxLength={1000}
                />
                <p className="text-muted-foreground text-xs mt-1">
                  {formData.message.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="flex-1"
                  disabled={!chef.available}
                >
                  {chef.available ? "Send Booking Request" : "Currently Unavailable"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  disabled={!chef.available}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-muted-foreground font-sans text-xs text-center">
                Free to request • Pay after confirmation
              </p>
            </form>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ChefProfile;
