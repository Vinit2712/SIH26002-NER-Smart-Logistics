// Fetches a real road-following path between two [lat, lng] points using
// OSRM's free public routing API (no key required). Returns an array of
// [lat, lng] points tracing actual roads, or null if the request fails.
//
// Note: this is a public demo server with fair-use rate limits — fine for
// a prototype/demo, not intended for production traffic.

export async function fetchRoadPath(startCoord, endCoord) {
  try {
    const [startLat, startLng] = startCoord;
    const [endLat, endLng] = endCoord;
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) return null;

    // GeoJSON coordinates come as [lng, lat] — flip to [lat, lng] for Leaflet
    const coordinates = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    return coordinates;
  } catch (err) {
    console.warn("Road routing failed, falling back to straight path:", err);
    return null;
  }
}

// Fetches road paths for multiple waypoint-based routes (an array of [lat,lng] pairs
// representing stops along the way) and stitches them into one continuous path.
export async function fetchRoadPathMultiStop(waypoints) {
  const segments = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segment = await fetchRoadPath(waypoints[i], waypoints[i + 1]);
    if (!segment) return null; // if any segment fails, bail out to fallback
    segments.push(segment);
  }
  return segments.flat();
}