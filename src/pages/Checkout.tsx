import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Check, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { contactDetailsSchema, deliveryAddressSchema } from "@/lib/validations";
import { z } from "zod";

const paymentMethods = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "google", label: "Google Pay", icon: "G" },
  { id: "apple", label: "Apple Pay", icon: "" },
  { id: "paypal", label: "PayPal", icon: "P" },
];

type FieldErrors = {
  contactDetails?: Record<string, string>;
  deliveryAddress?: Record<string, string>;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  
  const [contactDetails, setContactDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactDetails({ ...contactDetails, [name]: value });
    // Clear error for this field when user starts typing
    if (errors.contactDetails?.[name]) {
      setErrors((prev) => ({
        ...prev,
        contactDetails: { ...prev.contactDetails, [name]: undefined },
      }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress({ ...deliveryAddress, [name]: value });
    // Clear error for this field when user starts typing
    if (errors.deliveryAddress?.[name]) {
      setErrors((prev) => ({
        ...prev,
        deliveryAddress: { ...prev.deliveryAddress, [name]: undefined },
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    
    // Validate contact details
    const contactResult = contactDetailsSchema.safeParse(contactDetails);
    if (!contactResult.success) {
      newErrors.contactDetails = {};
      contactResult.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors.contactDetails![field] = err.message;
      });
    }

    // Validate delivery address
    const addressResult = deliveryAddressSchema.safeParse(deliveryAddress);
    if (!addressResult.success) {
      newErrors.deliveryAddress = {};
      addressResult.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors.deliveryAddress![field] = err.message;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    clearCart();
    setIsProcessing(false);
    
    toast({
      title: "Order Placed Successfully!",
      description: "You will receive a confirmation email shortly.",
    });

    navigate("/reservations");
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-16">
            <h2 className="font-serif text-xl mb-2">Your Cart is Empty</h2>
            <p className="text-muted-foreground font-sans mb-6">
              Add some chef services to your cart before checking out
            </p>
            <Link to="/">
              <Button variant="gold">Browse Chefs</Button>
            </Link>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/cart" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-serif text-lg">Checkout</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Sections */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Details */}
              <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-sans">1</span>
                  Contact Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={contactDetails.firstName}
                      onChange={handleContactChange}
                      placeholder="John"
                      className={`mt-1.5 ${errors.contactDetails?.firstName ? "border-destructive" : ""}`}
                      maxLength={50}
                    />
                    <ErrorMessage message={errors.contactDetails?.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={contactDetails.lastName}
                      onChange={handleContactChange}
                      placeholder="Doe"
                      className={`mt-1.5 ${errors.contactDetails?.lastName ? "border-destructive" : ""}`}
                      maxLength={50}
                    />
                    <ErrorMessage message={errors.contactDetails?.lastName} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={contactDetails.email}
                      onChange={handleContactChange}
                      placeholder="john@example.com"
                      className={`mt-1.5 ${errors.contactDetails?.email ? "border-destructive" : ""}`}
                      maxLength={255}
                    />
                    <ErrorMessage message={errors.contactDetails?.email} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={contactDetails.phone}
                      onChange={handleContactChange}
                      placeholder="+1 (555) 000-0000"
                      className={`mt-1.5 ${errors.contactDetails?.phone ? "border-destructive" : ""}`}
                      maxLength={20}
                    />
                    <ErrorMessage message={errors.contactDetails?.phone} />
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-sans">2</span>
                  Event Location
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={deliveryAddress.street}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street"
                      className={`mt-1.5 ${errors.deliveryAddress?.street ? "border-destructive" : ""}`}
                      maxLength={200}
                    />
                    <ErrorMessage message={errors.deliveryAddress?.street} />
                  </div>
                  <div>
                    <Label htmlFor="apartment">Apartment, Suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      name="apartment"
                      value={deliveryAddress.apartment}
                      onChange={handleAddressChange}
                      placeholder="Apt 4B"
                      className="mt-1.5"
                      maxLength={100}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={deliveryAddress.city}
                        onChange={handleAddressChange}
                        placeholder="New York"
                        className={`mt-1.5 ${errors.deliveryAddress?.city ? "border-destructive" : ""}`}
                        maxLength={100}
                      />
                      <ErrorMessage message={errors.deliveryAddress?.city} />
                    </div>
                    <div>
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={deliveryAddress.state}
                        onChange={handleAddressChange}
                        placeholder="NY"
                        className={`mt-1.5 ${errors.deliveryAddress?.state ? "border-destructive" : ""}`}
                        maxLength={100}
                      />
                      <ErrorMessage message={errors.deliveryAddress?.state} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={deliveryAddress.zipCode}
                        onChange={handleAddressChange}
                        placeholder="10001"
                        className={`mt-1.5 ${errors.deliveryAddress?.zipCode ? "border-destructive" : ""}`}
                        maxLength={20}
                      />
                      <ErrorMessage message={errors.deliveryAddress?.zipCode} />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={deliveryAddress.country}
                        onChange={handleAddressChange}
                        placeholder="United States"
                        className={`mt-1.5 ${errors.deliveryAddress?.country ? "border-destructive" : ""}`}
                        maxLength={100}
                      />
                      <ErrorMessage message={errors.deliveryAddress?.country} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-sans">3</span>
                  Payment Method
                </h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                        <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm font-semibold">
                          {method.icon}
                        </span>
                        <span className="font-sans">{method.label}</span>
                      </Label>
                      {paymentMethod === method.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Secure card payment will be processed via Stripe at checkout
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-20">
                <h2 className="font-serif text-xl mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.chef.id}-${item.serviceType}`} className="flex gap-3">
                      <img
                        src={item.chef.image}
                        alt={item.chef.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm truncate">{item.chef.name}</p>
                        <p className="text-xs text-muted-foreground">{item.serviceType}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-sans text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>${(totalPrice * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-serif text-2xl text-primary">
                      ${(totalPrice * 1.13).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="xl"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By placing this order, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Checkout;
