import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Users, PartyPopper, Check, X, MessageSquare, Loader2, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingRequest {
  id: string;
  chef_id: string;
  buyer_id: string;
  event_date: string;
  event_time: string;
  guest_count: number;
  event_type: string;
  message: string | null;
  status: string;
  chef_response: string | null;
  created_at: string;
}

interface BookingRequestsListProps {
  chefProfileId: string;
}

const BookingRequestsList = ({ chefProfileId }: BookingRequestsListProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<BookingRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_desc");

  useEffect(() => {
    fetchRequests();
  }, [chefProfileId]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("chef_id", chefProfileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load booking requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (status: "accepted" | "declined") => {
    if (!respondingTo) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("booking_requests")
        .update({
          status,
          chef_response: responseMessage || null,
        })
        .eq("id", respondingTo.id);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((req) =>
          req.id === respondingTo.id
            ? { ...req, status, chef_response: responseMessage || null }
            : req
        )
      );

      toast({
        title: status === "accepted" ? "Booking Accepted" : "Booking Declined",
        description:
          status === "accepted"
            ? "The customer has been notified of your acceptance."
            : "The customer has been notified.",
      });

      setRespondingTo(null);
      setResponseMessage("");
    } catch (error: any) {
      console.error("Error responding to request:", error);
      toast({
        title: "Error",
        description: "Failed to respond to request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = requests.filter((request) => {
      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }
      
      // Date filter
      if (dateFilter && request.event_date !== dateFilter) {
        return false;
      }
      
      // Search query - search in event type, message, guest count
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesEventType = request.event_type.toLowerCase().includes(query);
        const matchesMessage = request.message?.toLowerCase().includes(query) || false;
        const matchesGuestCount = request.guest_count.toString().includes(query);
        const matchesDate = format(new Date(request.event_date), "MMM d, yyyy").toLowerCase().includes(query);
        
        if (!matchesEventType && !matchesMessage && !matchesGuestCount && !matchesDate) {
          return false;
        }
      }
      
      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        case "date_desc":
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        case "guests_asc":
          return a.guest_count - b.guest_count;
        case "guests_desc":
          return b.guest_count - a.guest_count;
        case "created_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "created_desc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [requests, searchQuery, statusFilter, dateFilter, sortBy]);

  const pendingRequests = filteredRequests.filter((r) => r.status === "pending");
  const pastRequests = filteredRequests.filter((r) => r.status !== "pending");
  
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter("");
    setSortBy("created_desc");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || dateFilter || sortBy !== "created_desc";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Filter Bookings</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event type, date, or guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Date Filter */}
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">Newest First</SelectItem>
                  <SelectItem value="created_asc">Oldest First</SelectItem>
                  <SelectItem value="date_asc">Event Date (Earliest)</SelectItem>
                  <SelectItem value="date_desc">Event Date (Latest)</SelectItem>
                  <SelectItem value="guests_desc">Most Guests</SelectItem>
                  <SelectItem value="guests_asc">Fewest Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredRequests.length} of {requests.length} requests
                </p>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <div>
        <h3 className="font-serif text-lg mb-4">
          Pending Requests ({pendingRequests.length})
        </h3>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No pending requests at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(request.event_date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {request.event_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {request.guest_count} guests
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PartyPopper className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{request.event_type}</span>
                      </div>
                      {request.message && (
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Received {format(new Date(request.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRespondingTo(request)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setRespondingTo(request);
                          handleRespond("accepted");
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Requests */}
      {pastRequests.length > 0 && (
        <div>
          <h3 className="font-serif text-lg mb-4">Past Requests</h3>
          <div className="space-y-4">
            {pastRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(request.event_date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {request.guest_count} guests
                        </div>
                        <span className="font-medium">{request.event_type}</span>
                      </div>
                      {request.chef_response && (
                        <p className="text-sm text-muted-foreground">
                          Your response: "{request.chef_response}"
                        </p>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={!!respondingTo && respondingTo.status === "pending"} onOpenChange={() => setRespondingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Booking Request</DialogTitle>
            <DialogDescription>
              Optionally add a message explaining why you can't accept this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="e.g., I'm already booked for that date, but I'd be happy to discuss alternative dates..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRespondingTo(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRespond("declined")}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Decline Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingRequestsList;
