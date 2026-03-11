// Haversine formula - returns distance in km between two lat/lng points
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode an Irish address or Eircode using Nominatim (OpenStreetMap)
export async function geocodeIrishAddress(address) {
  try {
    const query = encodeURIComponent(`${address}, Ireland`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ie`;
    const res = await fetch(url, { headers: { 'User-Agent': 'HospoIreland/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {}
  return null;
}

// Irish city/area approximate coordinates (fallback)
const LOCATION_COORDS = {
  "Dublin": { lat: 53.3498, lng: -6.2603 },
  "Dublin 1": { lat: 53.3498, lng: -6.2603 },
  "Dublin 2": { lat: 53.3382, lng: -6.2591 },
  "Dublin 4": { lat: 53.3241, lng: -6.2295 },
  "Dublin 6": { lat: 53.3178, lng: -6.2636 },
  "Dublin 8": { lat: 53.3363, lng: -6.2862 },
  "Dublin City Centre": { lat: 53.3498, lng: -6.2603 },
  "Dun Laoghaire": { lat: 53.2941, lng: -6.1351 },
  "Rathmines": { lat: 53.3224, lng: -6.2638 },
  "Ranelagh": { lat: 53.3243, lng: -6.2560 },
  "Sandymount": { lat: 53.3280, lng: -6.2026 },
  "Ballsbridge": { lat: 53.3274, lng: -6.2336 },
  "Blackrock": { lat: 53.3016, lng: -6.1768 },
  "Stillorgan": { lat: 53.2952, lng: -6.2097 },
  "Dalkey": { lat: 53.2767, lng: -6.1007 },
  "Malahide": { lat: 53.4510, lng: -6.1553 },
  "Swords": { lat: 53.4597, lng: -6.2182 },
  "Dundrum": { lat: 53.2952, lng: -6.2453 },
  "Terenure": { lat: 53.3118, lng: -6.2817 },
  "Cork": { lat: 51.8985, lng: -8.4756 },
  "Cork City": { lat: 51.8985, lng: -8.4756 },
  "Galway": { lat: 53.2707, lng: -9.0568 },
  "Limerick": { lat: 52.6638, lng: -8.6267 },
  "Waterford": { lat: 52.2593, lng: -7.1101 },
  "Kilkenny": { lat: 52.6541, lng: -7.2448 },
  "Wexford": { lat: 52.3369, lng: -6.4633 },
  "Sligo": { lat: 54.2766, lng: -8.4761 },
  "Drogheda": { lat: 53.7179, lng: -6.3561 },
  "Bray": { lat: 53.2019, lng: -6.0983 },
  "Wicklow": { lat: 52.9798, lng: -6.0440 },
  "Naas": { lat: 53.2196, lng: -6.6644 },
  "Kildare": { lat: 53.1580, lng: -6.9093 },
  "Maynooth": { lat: 53.3804, lng: -6.5946 },
  "Derry": { lat: 54.9966, lng: -7.3086 },
  "Belfast": { lat: 54.5973, lng: -5.9301 },
};

export function getLocationCoords(locationName) {
  if (!locationName) return null;
  if (LOCATION_COORDS[locationName]) return LOCATION_COORDS[locationName];
  const key = Object.keys(LOCATION_COORDS).find(k =>
    locationName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(locationName.toLowerCase())
  );
  return key ? LOCATION_COORDS[key] : null;
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

export function getShiftDistance(shift, userLocation) {
  if (!userLocation) return null;
  // Prefer stored GPS coordinates on the shift
  if (shift.venue_latitude && shift.venue_longitude) {
    return getDistanceKm(userLocation.lat, userLocation.lng, shift.venue_latitude, shift.venue_longitude);
  }
  // Fallback to lookup table by location name
  const coords = getLocationCoords(shift.location);
  if (!coords) return null;
  return getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
}