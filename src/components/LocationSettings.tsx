import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Geolocation } from "@capacitor/geolocation";
import { toast } from "@/hooks/use-toast";

interface LocationSettingsProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const LocationSettings = ({ location, onLocationChange }: LocationSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState(location);

  const detectLocation = async () => {
    setIsLoading(true);
    try {
      // Request permission first
      const permission = await Geolocation.requestPermissions();
      
      if (permission.location !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Please enable location access in your device settings.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode using a free service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      const city = data.address?.city || data.address?.town || data.address?.village || "";
      const country = data.address?.country || "";
      const locationString = city && country ? `${city}, ${country}` : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      setManualAddress(locationString);
      onLocationChange(locationString);
      
      toast({
        title: "Location Updated",
        description: `Your location has been set to ${locationString}`,
      });
    } catch (error) {
      console.error("Geolocation error:", error);
      toast({
        title: "Location Error",
        description: "Unable to detect your location. Please enter it manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = () => {
    if (manualAddress.trim()) {
      onLocationChange(manualAddress.trim());
      toast({
        title: "Location Saved",
        description: `Your location has been set to ${manualAddress.trim()}`,
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-lg">Your Location</h3>
      </div>

      {/* Current Location Display */}
      {location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-md px-3 py-2">
          <MapPin className="w-4 h-4" />
          <span>Current: {location}</span>
        </div>
      )}

      {/* GPS Detection Button */}
      <Button
        variant="gold"
        onClick={detectLocation}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Detecting...
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4 mr-2" />
            Use My Current Location
          </>
        )}
      </Button>

      {/* Manual Entry */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or enter manually</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="City or address..."
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          className="flex-1 bg-secondary border-border"
        />
        <Button
          variant="elegant"
          onClick={handleManualSave}
          disabled={!manualAddress.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default LocationSettings;
