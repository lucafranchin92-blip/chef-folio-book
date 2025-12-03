import { z } from "zod";

// Checkout form validation schemas
export const contactDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[+]?[\d\s\-()]+$/, "Please enter a valid phone number"),
});

export const deliveryAddressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, "Street address is required")
    .max(200, "Street address must be less than 200 characters"),
  apartment: z
    .string()
    .trim()
    .max(100, "Apartment must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(100, "State must be less than 100 characters"),
  zipCode: z
    .string()
    .trim()
    .min(1, "ZIP code is required")
    .max(20, "ZIP code must be less than 20 characters"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country must be less than 100 characters"),
});

export const checkoutSchema = z.object({
  contactDetails: contactDetailsSchema,
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: z.enum(["card", "google", "apple", "paypal"]),
});

// Chef booking form validation schema
export const bookingFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z
    .string()
    .min(1, "Number of guests is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 2 && num <= 50;
    }, "Number of guests must be between 2 and 50"),
  eventType: z.string().min(1, "Event type is required"),
  location: z
    .string()
    .trim()
    .min(1, "Event location is required")
    .max(200, "Location must be less than 200 characters"),
  message: z
    .string()
    .trim()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ContactDetails = z.infer<typeof contactDetailsSchema>;
export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
