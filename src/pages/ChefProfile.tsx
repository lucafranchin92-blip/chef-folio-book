import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { chefs } from "@/data/chefs";
import { toast } from "@/hooks/use-toast";

const eventTypes = [
  "Intimate Dinner",
  "Anniversary",
  "Birthday",
  "Corporate Event",
  "Wedding",
  "Holiday Gathering",
];

const ChefProfile = () => {
  const { id } = useParams();
  const chef = chefs.find((c) => c.id === id);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "",
    eventType: "",
    location: "",
    message: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
                    required
                    disabled={!chef.available}
                    className="bg-secondary border-border"
                  />
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
                    required
                    disabled={!chef.available}
                    className="bg-secondary border-border"
                  />
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
                    required
                    disabled={!chef.available}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-sans text-sm mb-2">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    disabled={!chef.available}
                    className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground font-sans text-sm"
                  >
                    <option value="">Select type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
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
                  required
                  disabled={!chef.available}
                  className="bg-secondary border-border"
                />
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
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="xl"
                className="w-full"
                disabled={!chef.available}
              >
                {chef.available ? "Send Booking Request" : "Currently Unavailable"}
              </Button>

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
