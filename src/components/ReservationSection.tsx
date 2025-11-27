import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Calendar, Users, Clock, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const eventTypes = [
  "Intimate Dinner",
  "Anniversary",
  "Birthday Celebration",
  "Corporate Event",
  "Wedding Reception",
  "Holiday Gathering",
];

const ReservationSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    eventType: "",
    location: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Reservation Request Received",
      description: "Thank you! Chef Laurent will contact you within 24 hours to discuss your event.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "",
      eventType: "",
      location: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="reservation" className="py-24 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-sans text-sm tracking-[0.3em] uppercase mb-4">
              Book Your Experience
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-4">
              Reserve Your <span className="text-primary">Private Dining</span>
            </h2>
            <p className="text-muted-foreground font-sans max-w-2xl mx-auto">
              Begin your culinary journey by submitting a reservation request. 
              Chef Laurent will personally review your event details and reach out to discuss your vision.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">Full Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">Email *</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">Phone *</label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground font-sans text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Preferred Date *
                </label>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Preferred Time *
                </label>
                <Input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Number of Guests *
                </label>
                <Input
                  name="guests"
                  type="number"
                  min="2"
                  max="50"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  placeholder="2-50 guests"
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-muted-foreground font-sans text-sm mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Event Location *
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="City or full address"
                  className="bg-secondary border-border focus:border-primary"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <label className="block text-muted-foreground font-sans text-sm mb-2">
                Special Requests & Dietary Requirements
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your vision, dietary restrictions, allergies, or any special requests..."
                rows={4}
                className="bg-secondary border-border focus:border-primary resize-none"
              />
            </div>

            <div className="mt-8 text-center">
              <Button type="submit" variant="gold" size="xl">
                Submit Reservation Request
              </Button>
              <p className="text-muted-foreground font-sans text-xs mt-4">
                Typically respond within 24 hours. A 30% deposit is required to confirm booking.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ReservationSection;
