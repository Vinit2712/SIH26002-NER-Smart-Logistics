import { districts } from "../mockData/districts";
import { roads } from "../mockData/roads";
import { routes } from "../mockData/routes";
import { vehicles } from "../mockData/vehicles";
import { alerts } from "../mockData/alerts";
import { risks } from "../mockData/risks";
import { knownLocations } from "../mockData/locations";
import { haversineDistanceKm, midpointOffset } from "../utils/geo";

// Simulates network latency so the app behaves like it's talking to a real backend.
const MOCK_DELAY_MS = 300;

function mockRequest(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY_MS);
  });
}

// ---- Districts ----
export async function getDistricts() {
  return mockRequest(districts);
}

// ---- Roads ----
export async function getRoads() {
  return mockRequest(roads);
}

// ---- Risk data ----
export async function getRisks() {
  return mockRequest(risks);
}

// ---- Routes ----
export async function getRoutes() {
  return mockRequest(routes);
}

export async function getRouteByOriginDestination(origin, destination) {
  const match = routes.find(
    (r) => r.origin === origin && r.destination === destination
  );
  return mockRequest(match || null);
}

export async function getRouteByVehicleId(vehicleId) {
  const match = routes.find((r) => r.vehicleId === vehicleId);
  return mockRequest(match || null);
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 1000;
  }
  return h;
}

function riskLevelFromScore(score) {
  if (score >= 80) return "critical";
  if (score >= 55) return "high";
  if (score >= 25) return "medium";
  return "low";
}

// Returns a route for ANY origin/destination pair — uses a predefined
// route if one exists in mock data, otherwise generates a realistic
// synthetic one using real distance + a consistent risk score.
export async function getRouteForPair(origin, destination) {
  if (!origin || !destination) {
    return mockRequest(null);
  }

  const explicit = routes.find((r) => r.origin === origin && r.destination === destination);
  if (explicit) {
    return mockRequest(explicit);
  }

  const originLoc = knownLocations.find((l) => l.name === origin);
  const destLoc = knownLocations.find((l) => l.name === destination);

  if (!originLoc || !destLoc) {
    return mockRequest(null);
  }

  const distanceKm = Math.round(haversineDistanceKm(originLoc.coordinates, destLoc.coordinates) * 1.25);
  const etaMinutes = Math.round((distanceKm / 35) * 60);

  const hash = simpleHash(origin + destination);
  const recScore = 20 + (hash % 70);
  const recLevel = riskLevelFromScore(recScore);
  const alt1Score = Math.max(5, recScore - 40);
  const alt2Score = Math.max(10, recScore - 20);

  const mid = midpointOffset(originLoc.coordinates, destLoc.coordinates, 0.05);
  const altMid1 = midpointOffset(originLoc.coordinates, destLoc.coordinates, 0.35);
  const altMid2 = midpointOffset(originLoc.coordinates, destLoc.coordinates, -0.35);

  const synthetic = {
    id: `synthetic-${origin}-${destination}`,
    vehicleId: null,
    origin,
    destination,
    recommended: {
      id: `${origin}-${destination}-rec`,
      roadName: `Direct Route (${origin} → ${destination})`,
      distanceKm,
      etaMinutes,
      riskLevel: recLevel,
      riskScore: recScore,
      delayMinutes: recLevel === "critical" ? 999 : Math.round(recScore * 0.6),
      reason: `AI-estimated route based on current regional risk conditions between ${origin} and ${destination}.`,
      coordinates: [originLoc.coordinates, mid, destLoc.coordinates],
    },
    alternative: {
      id: `${origin}-${destination}-alt1`,
      roadName: `Alternate Route via Bypass`,
      distanceKm: Math.round(distanceKm * 1.15),
      etaMinutes: Math.round(etaMinutes * 1.2),
      riskLevel: riskLevelFromScore(alt1Score),
      riskScore: alt1Score,
      delayMinutes: Math.round(alt1Score * 0.5),
      reason: `Slightly longer bypass route with lower overall risk exposure.`,
      coordinates: [originLoc.coordinates, altMid1, destLoc.coordinates],
    },
    alternative2: {
      id: `${origin}-${destination}-alt2`,
      roadName: `Alternate Route via Secondary Road`,
      distanceKm: Math.round(distanceKm * 1.3),
      etaMinutes: Math.round(etaMinutes * 1.35),
      riskLevel: riskLevelFromScore(alt2Score),
      riskScore: alt2Score,
      delayMinutes: Math.round(alt2Score * 0.5),
      reason: `Longer secondary route, kept as a backup option.`,
      coordinates: [originLoc.coordinates, altMid2, destLoc.coordinates],
    },
  };

  return mockRequest(synthetic);
}

// ---- Vehicles ----
export async function getVehicles() {
  return mockRequest(vehicles);
}

// ---- Alerts ----
export async function getAlerts() {
  return mockRequest(alerts);
}