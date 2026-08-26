import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { IVenue } from '@shared/types';
import { INDIAN_CITIES } from '@shared/constants';
import { VenueMap } from '../../components/maps/VenueMap';
import { FindVenuesNearMe } from '../../components/maps/FindVenuesNearMe';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { Search, MapPin, Users, Star, ArrowRight, SlidersHorizontal, Building } from 'lucide-react';

export const VenuesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || 'All';

  const [venues, setVenues] = useState<IVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [selectedCatering, setSelectedCatering] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');

  useEffect(() => {
    api
      .get<{ success: boolean; venues: IVenue[] }>('/venues')
      .then((res) => {
        if (res.success && res.venues) {
          setVenues(res.venues);
        }
      })
      .catch((err) => console.error('Failed to load venues:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase()) ||
      v.state.toLowerCase().includes(search.toLowerCase());

    const matchesCity = selectedCity === 'All' || v.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesPrice = v.pricePerDay <= maxPrice;
    const matchesCatering =
      selectedCatering === 'All' ||
      (selectedCatering === 'VegOnly' && v.cateringPolicy?.pureVegOnly) ||
      (selectedCatering === 'External' && v.cateringPolicy?.externalCateringAllowed);

    return matchesSearch && matchesCity && matchesPrice && matchesCatering;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-utsav-gold/30 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Building className="w-6 h-6 text-utsav-saffron" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Heritage Palaces, Forts & Auspicious Banquets
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Discover 100% verified Indian wedding venues with havan kund permissions and pure veg kitchens.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'split' : 'grid')}
            className="px-4 py-2 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-xs font-bold text-utsav-brown dark:text-utsav-ivory hover:bg-utsav-beige-300"
          >
            {viewMode === 'grid' ? '🗺️ Show Map Split' : '🖼️ Grid View Only'}
          </button>
        </div>
      </div>

      {/* Geolocation Section */}
      <FindVenuesNearMe />

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-utsav-gold absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search palace, fort, banquet..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
          >
            <option value="All">All Cities (Pan-India)</option>
            {INDIAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCatering}
            onChange={(e) => setSelectedCatering(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/40 text-xs text-utsav-brown dark:text-utsav-ivory focus:outline-none"
          >
            <option value="All">All Catering Policies</option>
            <option value="VegOnly">Pure Veg Only (Satvik)</option>
            <option value="External">Outside Caterers Allowed</option>
          </select>

          <div className="flex items-center space-x-2 px-2 text-xs">
            <span className="text-gray-500 whitespace-nowrap">Max Price:</span>
            <input
              type="range"
              min={100000}
              max={1000000}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-utsav-gold"
            />
            <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold whitespace-nowrap">
              ₹{(maxPrice / 100000).toFixed(1)}L
            </span>
          </div>
        </div>
      </div>

      {/* Main Content (Split View or Grid) */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Venues List */}
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading verified venues...</div>
            ) : filteredVenues.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No venues matched your criteria.</div>
            ) : (
              filteredVenues.map((venue) => (
                <div
                  key={venue._id}
                  className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/30 hover:border-utsav-gold shadow-md flex flex-col sm:flex-row gap-4 transition-all"
                >
                  <img
                    src={venue.photos?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                    alt={venue.name}
                    className="w-full sm:w-44 h-36 object-cover rounded-2xl border border-utsav-gold/30 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-utsav-saffron tracking-wider">
                          {venue.venueType}
                        </span>
                        <div className="flex items-center space-x-1 text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{venue.rating} ({venue.reviewCount})</span>
                        </div>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                        <span className="truncate">{venue.city}, {venue.state}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-utsav-gold/20 font-bold">
                      <span className="text-utsav-maroon-900 dark:text-utsav-saffron text-sm">
                        ₹{(venue.pricePerDay / 100000).toFixed(1)} Lakhs / day
                      </span>
                      <Link
                        to={`/venues/${venue._id}`}
                        className="px-3.5 py-1.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Leaflet Interactive Map */}
          <div className="sticky top-24 h-[700px]">
            <VenueMap venues={filteredVenues} className="h-full w-full" />
          </div>
        </div>
      ) : (
        /* Full Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue._id}
              className="rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl overflow-hidden hover:border-utsav-gold transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full">
                <img
                  src={venue.photos?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-utsav-gold text-[10px] font-bold uppercase border border-utsav-gold/40">
                  {venue.venueType}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold text-utsav-maroon-800 dark:text-utsav-gold line-clamp-1">
                    {venue.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{venue.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-utsav-saffron shrink-0" />
                  <span>{venue.city}, {venue.state}</span>
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-utsav-gold/20 font-bold">
                  <span className="text-utsav-maroon-900 dark:text-utsav-saffron text-sm">
                    ₹{(venue.pricePerDay / 100000).toFixed(1)} Lakhs / day
                  </span>
                  <Link
                    to={`/venues/${venue._id}`}
                    className="px-3.5 py-1.5 rounded-xl maroon-gradient-btn text-xs font-bold text-utsav-gold"
                  >
                    Details & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
