// Chaikin's corner-cutting algorithm — smooths a polyline into a curve
// by repeatedly replacing each straight segment with two points closer
// to the corners. No extra map library needed — still a plain Polyline.
export function smoothPath(points, iterations = 2) {
  let pts = points;
  for (let iter = 0; iter < iterations; iter++) {
    const newPts = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [lat0, lon0] = pts[i];
      const [lat1, lon1] = pts[i + 1];
      const q = [lat0 + 0.25 * (lat1 - lat0), lon0 + 0.25 * (lon1 - lon0)];
      const r = [lat0 + 0.75 * (lat1 - lat0), lon0 + 0.75 * (lon1 - lon0)];
      newPts.push(q, r);
    }
    newPts.push(pts[pts.length - 1]);
    pts = newPts;
  }
  return pts;
}

// Straight-line distance between two [lat, lng] points, in km (Haversine formula)
export function haversineDistanceKm([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Offsets the midpoint between two coordinates perpendicular to the line,
// used to generate visually distinct alternate route paths.
export function midpointOffset([lat1, lon1], [lat2, lon2], offsetFactor) {
  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;
  const dx = lat2 - lat1;
  const dy = lon2 - lon1;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const normX = -dy / length;
  const normY = dx / length;
  return [midLat + normX * offsetFactor, midLon + normY * offsetFactor];
}