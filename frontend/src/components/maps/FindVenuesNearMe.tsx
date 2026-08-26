import React, { useState } from 'react';
import { Navigation, Loader2, MapPin, Compass, SlidersHorizontal } from 'lucide-react';
import { api } from '../../api/client';
import { IVenue } from '@shared/types';
import { VenueMap } from './VenueMap';
import { Link } from 'react-router-dom';

export const FindVenuesNearMe: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [nearbyVenues, setNearbyVenues] = useState<IVenue[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const res = await api.get<{ success: boolean; venues: IVenue[] }>('/venues', {
            userLat: latitude,
            userLng: longitude,
            radiusKm,
          });

          if (res.success) {
            setNearbyVenues(res.venues);
          }
        } catch (err: any) {
          setError(err.message || 'Could not fetch nearby venues.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        // Fallback demo location (Jaipur / Delhi center)
        console.warn('Geolocation denied, falling back to Jaipur default coordinates:', err);
        const fallbackLat = 26.9124;
        const fallbackLng = 75.7873;
        setUserLocation({ lat: fallbackLat, lng: fallbackLng });

        api
          .get<{ success: boolean; venues: IVenue[] }>('/venues', {
            userLat: fallbackLat,
            userLng: fallbackLng,
            radiusKm,
          })
          .then((res) => {
            if (res.success) setNearbyVenues(res.venues);
          })
          .catch(() => {});
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="p-6 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-utsav-saffron" />
            <h3 className="font-heading text-lg font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Find Venues Near Me
            </h3>
          </div>
          <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300 mt-0.5">
            Use your device GPS to locate heritage palaces, banquets, and temple gardens near you.
          </p>
        </div>

        <button
          onClick={handleLocateMe}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl gold-gradient-btn text-xs sm:text-sm font-bold shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          <span>{loading ? 'Locating...' : 'Use My Live Location'}</span>
        </button>
      </div>

      {/* Radius Slider if located */}
      {userLocation && (
        <div className="flex items-center space-x-4 p-3.5 rounded-2xl bg-utsav-beige-100 dark:bg-utsav-maroon-950 border border-utsav-gold/30">
          <SlidersHorizontal className="w-4 h-4 text-utsav-gold shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold text-utsav-brown dark:text-utsav-ivory mb-1">
              <span>Distance Radius</span>
              <span className="text-utsav-maroon-800 dark:text-utsav-gold">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={10}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-utsav-gold cursor-pointer"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Map & Results */}
      {userLocation && nearbyVenues.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VenueMap
              venues={nearbyVenues}
              center={[userLocation.lat, userLocation.lng]}
              zoom={10}
              className="h-[380px] w-full"
            />
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
              {nearbyVenues.length} Venues Found (Sorted by Distance)
            </h4>

            {nearbyVenues.map((venue) => (
              <div
                key={venue._id}
                className="p-3 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 shadow-sm space-y-2 hover:border-utsav-gold transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1">
                      {venue.name}
                    </h5>
                    <p className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-utsav-saffron" />
                      <span>{venue.city}</span>
                      {venue.distanceKm !== undefined && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          • {venue.distanceKm} km away
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-utsav-maroon-900 dark:text-utsav-saffron">
                    ₹{(venue.pricePerDay / 100000).toFixed(1)}L
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-utsav-gold/10">
                  <span className="text-gray-500">Cap: {venue.capacity?.max}</span>
                  <Link
                    to={`/venues/${venue._id}`}
                    className="text-utsav-maroon-800 dark:text-utsav-gold font-bold hover:underline"
                  >
                    View & Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
