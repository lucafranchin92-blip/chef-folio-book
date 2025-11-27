export interface Chef {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  experience: string;
  description: string;
  cuisines: string[];
  available: boolean;
}

export interface Reservation {
  id: string;
  chefId: string;
  userId: string;
  date: string;
  time: string;
  guests: number;
  eventType: string;
  location: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  message?: string;
}
