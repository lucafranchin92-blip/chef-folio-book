import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BookingRequest {
  id: string;
  event_date: string;
  event_time: string;
  guest_count: number;
  event_type: string;
  status: string;
  message: string | null;
}

interface BookingCalendarViewProps {
  chefProfileId: string;
}

const BookingCalendarView = ({ chefProfileId }: BookingCalendarViewProps) => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [chefProfileId]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("id, event_date, event_time, guest_count, event_type, status, message")
        .eq("chef_id", chefProfileId);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((booking) =>
      isSameDay(new Date(booking.event_date), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "declined":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-600">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get the day of week for the first day of month (0-6)
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  
  // Create empty cells for days before the first day of month
  const emptyDays = Array(firstDayOfMonth).fill(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Declined</span>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square p-1" />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day);
            const isToday = isSameDay(day, new Date());
            const hasBookings = dayBookings.length > 0;

            return (
              <Popover key={day.toISOString()}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "aspect-square p-1 rounded-lg border transition-colors relative",
                      "hover:border-primary hover:bg-accent/50",
                      isToday && "border-primary bg-primary/10",
                      hasBookings && "cursor-pointer",
                      !hasBookings && "cursor-default"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={cn(
                          "text-sm",
                          isToday && "font-bold text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {hasBookings && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {dayBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking.id}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                getStatusColor(booking.status)
                              )}
                            />
                          ))}
                          {dayBookings.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{dayBookings.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                {hasBookings && (
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b">
                      <h4 className="font-medium">
                        {format(day, "EEEE, MMMM d, yyyy")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-3 border-b last:border-b-0 hover:bg-accent/50"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <PartyPopper className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {booking.event_type}
                              </span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {booking.event_time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {booking.guest_count} guests
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-serif">
                {bookings.filter((b) => b.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-serif">
                {bookings.filter((b) => b.status === "accepted").length}
              </p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
            <div>
              <p className="text-2xl font-serif">
                {bookings.filter((b) => b.status === "declined").length}
              </p>
              <p className="text-sm text-muted-foreground">Declined</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendarView;
