import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Calendar, Clock, Users, PartyPopper, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const bookingSchema = z.object({
  eventDate: z.string().min(1, "Date is required"),
  eventTime: z.string().min(1, "Time is required"),
  guestCount: z.number().min(1, "At least 1 guest required").max(100, "Maximum 100 guests"),
  eventType: z.string().min(1, "Event type is required"),
  message: z.string().max(500, "Message must be under 500 characters").optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const eventTypes = [
  "Dinner Party",
  "Birthday Celebration",
  "Anniversary",
  "Corporate Event",
  "Wedding Reception",
  "Holiday Gathering",
  "Romantic Dinner",
  "Cooking Class",
  "Other",
];

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "5:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
  "7:30 PM", "8:00 PM", "8:30 PM",
];

interface BookingRequestFormProps {
  chefId: string;
  chefName: string;
}

const BookingRequestForm = ({ chefId, chefName }: BookingRequestFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BookingForm>({
    eventDate: "",
    eventTime: "",
    guestCount: 2,
    eventType: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send a booking request.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("booking_requests").insert({
        chef_id: chefId,
        buyer_id: user.id,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        guest_count: formData.guestCount,
        event_type: formData.eventType,
        message: formData.message || null,
      });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: `Your booking request has been sent to ${chefName}.`,
      });

      setOpen(false);
      setFormData({
        eventDate: "",
        eventTime: "",
        guestCount: 2,
        eventType: "",
        message: "",
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error submitting booking:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="lg" className="w-full">
          <Send className="w-4 h-4 mr-2" />
          Request Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Book {chefName}</DialogTitle>
          <DialogDescription>
            Fill in your event details and the chef will respond to your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="eventDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Event Date *
            </Label>
            <Input
              id="eventDate"
              type="date"
              min={minDateStr}
              value={formData.eventDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventDate: e.target.value }))
              }
            />
            {errors.eventDate && (
              <p className="text-sm text-destructive">{errors.eventDate}</p>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Preferred Time *
            </Label>
            <Select
              value={formData.eventTime}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, eventTime: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventTime && (
              <p className="text-sm text-destructive">{errors.eventTime}</p>
            )}
          </div>

          {/* Guest Count */}
          <div className="space-y-2">
            <Label htmlFor="guestCount" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Number of Guests *
            </Label>
            <Input
              id="guestCount"
              type="number"
              min={1}
              max={100}
              value={formData.guestCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  guestCount: parseInt(e.target.value) || 1,
                }))
              }
            />
            {errors.guestCount && (
              <p className="text-sm text-destructive">{errors.guestCount}</p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <PartyPopper className="w-4 h-4" />
              Event Type *
            </Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, eventType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="text-sm text-destructive">{errors.eventType}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Additional Details</Label>
            <Textarea
              id="message"
              placeholder="Any dietary restrictions, special requests, or details about your event..."
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.message?.length || 0)}/500 characters
            </p>
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingRequestForm;
