import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AlertsProvider } from './context/AlertsContext.jsx'
import { VehiclesProvider } from './context/VehiclesContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AlertsProvider>
        <VehiclesProvider>
          <App />
        </VehiclesProvider>
      </AlertsProvider>
    </AuthProvider>
  </StrictMode>,
)