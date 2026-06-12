"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Map as MapIcon, ChevronRight, AlertTriangle, CheckCircle2, ShieldCheck, Locate } from "lucide-react";
import toast from "react-hot-toast";

interface LocationGuardProps {
  children: React.ReactNode;
  restaurantLat?: number;
  restaurantLng?: number;
  allowedRadius?: number; // in meters
}

// Default coordinates (e.g., a dummy location or a real one)
// Latitude/Longitude for the restaurant
// You can update these via env variables or props
const DEFAULT_LAT = 9.2708149;
const DEFAULT_LNG = 76.4495109;
const DEFAULT_RADIUS = 50; // 50 meters

export default function LocationGuard({
  children,
  restaurantLat = Number(process.env.NEXT_PUBLIC_RESTAURANT_LAT) || DEFAULT_LAT,
  restaurantLng = Number(process.env.NEXT_PUBLIC_RESTAURANT_LNG) || DEFAULT_LNG,
  allowedRadius = Number(process.env.NEXT_PUBLIC_ALLOWED_RADIUS) || DEFAULT_RADIUS,
}: LocationGuardProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showSuccessUI, setShowSuccessUI] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Haversine formula to calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleVerifyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      toast.error("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        const dist = calculateDistance(latitude, longitude, restaurantLat, restaurantLng);
        setDistance(dist);

        if (dist <= allowedRadius) {
          setShowSuccessUI(true);
          toast.success("Location verified!");
          setTimeout(() => {
            setIsVerified(true);
          }, 2000);
        } else {
          setIsVerified(false);
          toast.error("You are outside the restaurant area.");
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Access denied. Please enable location permissions in your browser settings to continue.");
            toast.error("Permission denied");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Please try again.");
            toast.error("Location unavailable");
            break;
          case err.TIMEOUT:
            setError("The request to get user location timed out. Please try again.");
            toast.error("Request timeout");
            break;
          default:
            setError("An unknown error occurred.");
            toast.error("Unknown error");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurantLat},${restaurantLng}`;
    window.open(url, "_blank");
  };

  // If verified, show content
  if (isVerified) {
    return <>{children}</>;
  }

  // Verification Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header */}
          <div className="text-center mb-10">
            {showSuccessUI ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 relative">
                   <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                   <CheckCircle2 className="w-10 h-10 text-emerald-400 relative z-10" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                  Access <span className="text-emerald-400">Granted</span>
                </h1>
                <p className="mt-3 text-emerald-400/70 font-black uppercase tracking-widest text-[10px]">
                  You are within the restaurant location
                </p>
                <div className="mt-8 flex items-center gap-2">
                   <div className="h-1 w-12 bg-emerald-500/30 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 animate-progress origin-left" />
                   </div>
                   <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Redirecting to menu</span>
                </div>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 mb-6 group">
                  <Locate className={`w-10 h-10 text-indigo-400 ${loading ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                  Location <span className="text-indigo-400">Verification</span>
                </h1>
                <p className="mt-3 text-white/50 font-medium px-4">
                  To browse our menu and place orders, please confirm you are at the restaurant.
                </p>
              </>
            )}
          </div>

          {!showSuccessUI && (
            <>
              {/* Status Area */}
              <div className="space-y-4 mb-8">
            {isVerified === false && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-300">Access Denied</h3>
                    <p className="text-xs text-red-500/70 font-medium">
                      {distance 
                        ? `You are ${(distance / 1000).toFixed(2)}km away from the restaurant.` 
                        : "You must be inside the restaurant to view the menu."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300">Action Required</h3>
                    <p className="text-xs text-amber-500/70 font-medium leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!error && isVerified === null && !loading && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-emerald-300">Ready to Scan</h3>
                    <p className="text-xs text-emerald-500/70 font-medium truncate">
                      Tap verify to match your coordinates.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid gap-4">
            <button
              onClick={handleVerifyLocation}
              disabled={loading}
              className={`group relative overflow-hidden py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                loading 
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-neutral-200 active:scale-95'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                    Fetching Location...
                  </>
                ) : (
                  <>
                    Verify My Location
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            <button
              onClick={openInGoogleMaps}
              className="group flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
            >
              <MapIcon className="w-4 h-4" />
              Manual Verification (Maps)
            </button>
          </div>

            </>
          )}

          {/* Footer Info */}
          <div className="mt-8 flex justify-center items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Secure GPS
            </span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>Encrypted Scan</span>
          </div>
        </div>


        {/* Small Legal/Privacy Hint */}
        <p className="mt-6 text-center text-[10px] text-white/30 font-medium px-8 italic">
          * Your location is only used for verification and is never stored on our servers.
        </p>
      </div>
    </div>
  );
}
