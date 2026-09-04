import { districts } from "../mockData/districts";
import { roads } from "../mockData/roads";
import { routes } from "../mockData/routes";
import { vehicles } from "../mockData/vehicles";
import { alerts } from "../mockData/alerts";
import { risks } from "../mockData/risks";

// Simulates network latency so the app behaves like it's talking to a real backend.
const MOCK_DELAY_MS = 300;

function mockRequest(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY_MS);
  });
}

// ---- Districts ----
// Real backend equivalent: GET /districts
export async function getDistricts() {
  return mockRequest(districts);
}

// ---- Roads ----
// Real backend equivalent: GET /roads
export async function getRoads() {
  return mockRequest(roads);
}

// ---- Risk data ----
// Real backend equivalent: GET /risk
export async function getRisks() {
  return mockRequest(risks);
}

// ---- Routes ----
// Real backend equivalent: GET /routes?origin=...&destination=...
export async function getRoutes() {
  return mockRequest(routes);
}

export async function getRouteByOriginDestination(origin, destination) {
  const match = routes.find(
    (r) => r.origin === origin && r.destination === destination
  );
  return mockRequest(match || null);
}

// ---- Vehicles ----
// Real backend equivalent: GET /vehicles
export async function getVehicles() {
  return mockRequest(vehicles);
}

// ---- Alerts ----
// Real backend equivalent: GET /alerts
export async function getAlerts() {
  return mockRequest(alerts);
}