import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Upload, X, Plus, ChefHat } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const chefProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  specialty: z.string().min(2, "Specialty is required").max(100),
  location: z.string().min(2, "Location is required").max(200),
  experience: z.string().min(1, "Experience is required"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  priceRange: z.string().min(1, "Price range is required"),
  cuisines: z.array(z.string()).min(1, "Add at least one cuisine"),
  available: z.boolean(),
});

type ChefProfileForm = z.infer<typeof chefProfileSchema>;

const cuisineOptions = [
  "French", "Italian", "Japanese", "Chinese", "Mexican", "Indian",
  "Thai", "Mediterranean", "American", "Korean", "Vietnamese", "Spanish",
  "Greek", "Middle Eastern", "Caribbean", "Peruvian", "Brazilian", "Ethiopian"
];

const experienceOptions = [
  "1-3 years", "3-5 years", "5-10 years", "10-15 years", "15-20 years", "20+ years"
];

const priceRangeOptions = [
  { value: "$", label: "$ - Budget Friendly" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Upscale" },
  { value: "$$$$", label: "$$$$ - Premium" },
];

const ChefOnboarding = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ChefProfileForm>({
    name: "",
    specialty: "",
    location: "",
    experience: "",
    description: "",
    priceRange: "$$",
    cuisines: [],
    available: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCuisine, setNewCuisine] = useState("");

  // Redirect non-chef users
  if (!user || userRole !== "chef") {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-serif mb-2">Chef Access Only</h1>
          <p className="text-muted-foreground mb-6">
            This page is only available for users with a chef account.
          </p>
          <Button variant="gold" onClick={() => navigate("/auth")}>
            Sign In as Chef
          </Button>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addCuisine = (cuisine: string) => {
    if (cuisine && !formData.cuisines.includes(cuisine)) {
      setFormData(prev => ({
        ...prev,
        cuisines: [...prev.cuisines, cuisine],
      }));
    }
    setNewCuisine("");
  };

  const removeCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.filter(c => c !== cuisine),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = chefProfileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (imageFile && user) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("chef-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("chef-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Insert chef profile
      const { error: insertError } = await supabase
        .from("chef_profiles")
        .insert({
          user_id: user.id,
          name: formData.name,
          specialty: formData.specialty,
          location: formData.location,
          experience: formData.experience,
          description: formData.description,
          price_range: formData.priceRange,
          cuisines: formData.cuisines,
          available: formData.available,
          image_url: imageUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Profile Created!",
        description: "Your chef profile is now live on the marketplace.",
      });

      navigate("/profile");
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error creating profile:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif mb-2">Create Your Chef Profile</h1>
          <p className="text-muted-foreground">
            Set up your profile to start receiving bookings from customers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center hover:border-primary transition-colors"
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Upload</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Upload a professional photo. Max 5MB.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Chef Laurent Dubois"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty *</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={e => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="e.g., French Fine Dining, Japanese Omakase"
            />
            {errors.specialty && <p className="text-sm text-destructive">{errors.specialty}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., New York, NY"
            />
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>

          {/* Experience & Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience *</Label>
              <Select
                value={formData.experience}
                onValueChange={value => setFormData(prev => ({ ...prev, experience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map(exp => (
                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
            </div>

            <div className="space-y-2">
              <Label>Price Range *</Label>
              <Select
                value={formData.priceRange}
                onValueChange={value => setFormData(prev => ({ ...prev, priceRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priceRange && <p className="text-sm text-destructive">{errors.priceRange}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">About You *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your culinary background, training, and what makes your cooking special..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Cuisines */}
          <div className="space-y-2">
            <Label>Cuisines *</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.cuisines.map(cuisine => (
                <Badge key={cuisine} variant="secondary" className="gap-1">
                  {cuisine}
                  <button type="button" onClick={() => removeCuisine(cuisine)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newCuisine} onValueChange={addCuisine}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add cuisine..." />
                </SelectTrigger>
                <SelectContent>
                  {cuisineOptions
                    .filter(c => !formData.cuisines.includes(c))
                    .map(cuisine => (
                      <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {errors.cuisines && <p className="text-sm text-destructive">{errors.cuisines}</p>}
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div>
              <Label htmlFor="available" className="font-medium">Available for Bookings</Label>
              <p className="text-sm text-muted-foreground">
                Toggle off when you're fully booked
              </p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, available: checked }))}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Profile..." : "Create Chef Profile"}
          </Button>
        </form>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ChefOnboarding;
