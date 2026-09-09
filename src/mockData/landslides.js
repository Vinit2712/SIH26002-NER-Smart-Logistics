// Curated records from the project's NER landslide inventory (NASA Global
// Landslide Catalog). Keeping a compact frontend copy makes the driver view
// available even when the field connection is unreliable.
export const historicalLandslides = [
  { id: "NASA_GLC_2261", date: "2010-08-17", location: "Hatisur / Sevoke, NH 31A", state: "West Bengal", category: "Landslide", trigger: "Downpour", coordinates: [26.9435, 88.4445], susceptibility: "High" },
  { id: "NASA_GLC_1112", date: "2009-08-20", location: "Mile 27 near Rambi, NH 31A", state: "Sikkim", category: "Mudslide", trigger: "Downpour", coordinates: [27.1761, 88.5287], susceptibility: "High" },
  { id: "NASA_GLC_1755", date: "2010-04-17", location: "Pani House, Gangtok (NH 31A)", state: "Sikkim", category: "Landslide", trigger: "Downpour", coordinates: [27.3341, 88.6083], susceptibility: "Very high" },
  { id: "NASA_GLC_260", date: "2007-09-11", location: "Between Singtam and Rangpo, NH 31A", state: "Sikkim", category: "Debris flow", trigger: "Rain", coordinates: [27.2084, 88.4909], susceptibility: "Very high" },
  { id: "NASA_GLC_9931", date: "2017-06-30", location: "Bimparao village, NH-2", state: "Manipur", category: "Landslide", trigger: "Downpour", coordinates: [25.0666, 93.9311], susceptibility: "Low" },
  { id: "NASA_GLC_9186", date: "2016-07-25", location: "Tadubi, Imphal–Dimapur road", state: "Manipur", category: "Landslide", trigger: "Continuous rain", coordinates: [25.48, 94.1383], susceptibility: "Very high" },
  { id: "NASA_GLC_5123", date: "2013-07-17", location: "Meriema Village near Kohima, NH-2", state: "Nagaland", category: "Mudslide", trigger: "Rain", coordinates: [25.7131, 94.0885], susceptibility: "Very high" },
  { id: "NASA_GLC_2025", date: "2010-06-28", location: "Police CID complex, Shillong", state: "Meghalaya", category: "Landslide", trigger: "Downpour", coordinates: [25.5728, 91.885], susceptibility: "Very high" },
  { id: "NASA_GLC_9949", date: "2017-07-03", location: "Sonapur / Jorabat, G S Road", state: "Assam", category: "Landslide", trigger: "Downpour", coordinates: [26.1004, 91.8735], susceptibility: "Very low" },
  { id: "NASA_GLC_10004", date: "2017-07-10", location: "Dispur, Guwahati", state: "Assam", category: "Landslide", trigger: "Continuous rain", coordinates: [26.1455, 91.7936], susceptibility: "Very low" },
];

const KM_PER_LATITUDE_DEGREE = 111.32;

function distanceToSegmentKm(point, start, end) {
  const latitudeScale = KM_PER_LATITUDE_DEGREE;
  const longitudeScale = KM_PER_LATITUDE_DEGREE * Math.cos((point[0] * Math.PI) / 180);
  const px = point[1] * longitudeScale;
  const py = point[0] * latitudeScale;
  const ax = start[1] * longitudeScale;
  const ay = start[0] * latitudeScale;
  const bx = end[1] * longitudeScale;
  const by = end[0] * latitudeScale;
  const dx = bx - ax;
  const dy = by - ay;
  const progress = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(px - (ax + progress * dx), py - (ay + progress * dy));
}

export function getLandslidesNearRoute(coordinates, corridorKm = 28) {
  if (!coordinates || coordinates.length < 2) return [];
  return historicalLandslides
    .map((event) => ({
      ...event,
      distanceFromRouteKm: Math.min(...coordinates.slice(1).map((point, index) => distanceToSegmentKm(event.coordinates, coordinates[index], point))),
    }))
    .filter((event) => event.distanceFromRouteKm <= corridorKm)
    .sort((a, b) => a.distanceFromRouteKm - b.distanceFromRouteKm || b.date.localeCompare(a.date));
}

// Historical records indicate terrain exposure but must not, on their own,
// turn a route into a high-risk route decades later. Their contribution is
// capped at 20/100 and halves every five years; live rainfall/road reports
// remain the dominant inputs to the current operational risk score.
export function getHistoricalExposureScore(events, today = new Date()) {
  const susceptibilityWeight = { "Very high": 10, High: 7, Moderate: 5, Low: 3, "Very low": 1 };
  const rawScore = events.reduce((total, event) => {
    const ageYears = Math.max(0, (today - new Date(`${event.date}T00:00:00`)) / (365.25 * 24 * 60 * 60 * 1000));
    return total + (susceptibilityWeight[event.susceptibility] || 3) * (0.5 ** (ageYears / 5));
  }, 0);
  return Math.min(20, Math.round(rawScore));
}
