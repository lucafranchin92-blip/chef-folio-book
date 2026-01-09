import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Upload, X, ChefHat, Star, Users, Edit2, Save, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ChefProfile extends ChefProfileForm {
  id: string;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
}

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

const ChefDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  const [newCuisine, setNewCuisine] = useState("");

  useEffect(() => {
    if (user && userRole === "chef") {
      fetchProfile();
    }
  }, [user, userRole]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chef_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const profileData: ChefProfile = {
          id: data.id,
          name: data.name,
          specialty: data.specialty,
          location: data.location,
          experience: data.experience,
          description: data.description,
          priceRange: data.price_range,
          cuisines: data.cuisines,
          available: data.available ?? true,
          imageUrl: data.image_url,
          rating: data.rating ?? 0,
          reviewCount: data.review_count ?? 0,
        };
        setProfile(profileData);
        setFormData({
          name: profileData.name,
          specialty: profileData.specialty,
          location: profileData.location,
          experience: profileData.experience,
          description: profileData.description,
          priceRange: profileData.priceRange,
          cuisines: profileData.cuisines,
          available: profileData.available,
        });
        setImagePreview(profileData.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    setImagePreview(profile?.imageUrl || null);
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

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!profile || !user) return;

    try {
      const { error } = await supabase
        .from("chef_profiles")
        .update({ available: checked })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, available: checked } : null);
      setFormData(prev => ({ ...prev, available: checked }));
      
      toast({
        title: checked ? "Now Available" : "Marked Unavailable",
        description: checked 
          ? "You're now visible to customers looking for chefs."
          : "You won't appear in search results.",
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
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

    if (!profile || !user) return;
    setIsSaving(true);

    try {
      let imageUrl = profile.imageUrl;

      if (imageFile) {
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

      const { error: updateError } = await supabase
        .from("chef_profiles")
        .update({
          name: formData.name,
          specialty: formData.specialty,
          location: formData.location,
          experience: formData.experience,
          description: formData.description,
          price_range: formData.priceRange,
          cuisines: formData.cuisines,
          available: formData.available,
          image_url: imageUrl,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? {
        ...prev,
        ...formData,
        imageUrl,
      } : null);
      setImageFile(null);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        specialty: profile.specialty,
        location: profile.location,
        experience: profile.experience,
        description: profile.description,
        priceRange: profile.priceRange,
        cuisines: profile.cuisines,
        available: profile.available,
      });
      setImagePreview(profile.imageUrl);
      setImageFile(null);
    }
    setErrors({});
    setIsEditing(false);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <main className="container mx-auto px-4 py-12 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-serif mb-2">No Profile Yet</h1>
          <p className="text-muted-foreground mb-6">
            Create your chef profile to start receiving bookings.
          </p>
          <Button variant="gold" onClick={() => navigate("/chef-onboarding")}>
            Create Profile
          </Button>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif mb-1">Chef Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile and availability</p>
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-2xl font-serif">{profile.rating.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-serif">{profile.reviewCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={profile.available ? "default" : "secondary"}>
                  {profile.available ? "Available" : "Unavailable"}
                </Badge>
                <Switch
                  checked={profile.available}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              {isEditing ? (
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
              ) : (
                <div className="flex items-center gap-4">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <ChefHat className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-xl">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.specialty}</p>
                  </div>
                </div>
              )}
            </div>

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty *</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={e => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                    {errors.specialty && <p className="text-sm text-destructive">{errors.specialty}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Experience *</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={value => setFormData(prev => ({ ...prev, experience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map(exp => (
                          <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Price Range *</Label>
                  <Select
                    value={formData.priceRange}
                    onValueChange={value => setFormData(prev => ({ ...prev, priceRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label htmlFor="description">About You *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

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
                  <Select value={newCuisine} onValueChange={addCuisine}>
                    <SelectTrigger>
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
                  {errors.cuisines && <p className="text-sm text-destructive">{errors.cuisines}</p>}
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{profile.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{profile.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price Range</p>
                    <p className="font-medium">{profile.priceRange}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">About</p>
                  <p>{profile.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cuisines</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.cuisines.map(cuisine => (
                      <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default ChefDashboard;
