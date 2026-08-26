import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { IVenue } from '@shared/types';
import { Star, Users, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom Indian Gold/Maroon Map Marker Icon
const createCustomMarker = (price: number) => {
  const priceLakh = (price / 100000).toFixed(1);
  return L.divIcon({
    className: 'custom-utsav-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, #7A1F2B 0%, #9E1F33 100%);
        color: #FFF8EC;
        border: 2px solid #C9A227;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 11px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span>🪔 ₹${priceLakh}L</span>
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  });
};

interface VenueMapProps {
  venues: IVenue[];
  center?: [number, number];
  zoom?: number;
  selectedVenueId?: string;
  onSelectVenue?: (venue: IVenue) => void;
  className?: string;
}

export const VenueMap: React.FC<VenueMapProps> = ({
  venues,
  center = [20.5937, 78.9629], // Center of India or default city
  zoom = 5,
  selectedVenueId,
  onSelectVenue,
  className = 'h-[500px] w-full',
}) => {
  // If only 1 venue or specific venues, center on first
  const mapCenter: [number, number] =
    venues.length > 0 && venues[0].latitude && venues[0].longitude
      ? [venues[0].latitude, venues[0].longitude]
      : center;

  return (
    <div className={`relative rounded-3xl overflow-hidden border-2 border-utsav-gold/40 shadow-xl ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={venues.length === 1 ? 13 : zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {venues.map((venue) => {
          if (!venue.latitude || !venue.longitude) return null;
          return (
            <Marker
              key={venue._id}
              position={[venue.latitude, venue.longitude]}
              icon={createCustomMarker(venue.pricePerDay)}
              eventHandlers={{
                click: () => onSelectVenue && onSelectVenue(venue),
              }}
            >
              <Popup className="utsav-map-popup">
                <div className="p-1 space-y-2 max-w-[240px]">
                  <img
                    src={venue.photos?.[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                    alt={venue.name}
                    className="w-full h-28 object-cover rounded-xl border border-utsav-gold/30"
                  />
                  <div>
                    <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 line-clamp-1">
                      {venue.name}
                    </h4>
                    <div className="flex items-center text-[11px] text-gray-600 space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-utsav-saffron shrink-0" />
                      <span className="truncate">{venue.city}, {venue.state}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-utsav-gold/20">
                    <div className="flex items-center space-x-1 font-bold text-utsav-maroon-800">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{venue.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 text-[11px]">
                      <Users className="w-3.5 h-3.5" />
                      <span>Max {venue.capacity?.max}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-xs text-utsav-maroon-900">
                      ₹{(venue.pricePerDay / 100000).toFixed(1)}L / day
                    </span>
                    <Link
                      to={`/venues/${venue._id}`}
                      className="px-2.5 py-1 rounded-lg bg-utsav-maroon-800 text-utsav-ivory text-[10px] font-bold flex items-center space-x-0.5 hover:bg-utsav-maroon-700"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
