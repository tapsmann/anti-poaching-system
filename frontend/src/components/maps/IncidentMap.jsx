import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ZIMBABWE_CENTER = [-19.0, 29.5];

const severityColor = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const IncidentMap = ({
  incidents = [],
  hotspots = [],
  height = '16rem',
  center = ZIMBABWE_CENTER,
  zoom = 6,
  selectedId = null,
}) => {
  const markers = incidents.filter((i) => i.latitude != null && i.longitude != null);

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-earth-200">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((spot, idx) => (
          <CircleMarker
            key={`hotspot-${idx}`}
            center={[spot.lat, spot.lng]}
            radius={8 + (spot.risk_score || spot.risk || 0) / 15}
            pathOptions={{
              color: severityColor.critical,
              fillColor: severityColor.critical,
              fillOpacity: 0.35,
            }}
          >
            <Popup>
              Risk score: {Math.round(spot.risk_score || spot.risk || 0)}%
            </Popup>
          </CircleMarker>
        ))}
        {markers.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            opacity={selectedId && selectedId !== incident.id ? 0.5 : 1}
          >
            <Popup>
              <strong>{incident.incident_type}</strong>
              <br />
              {incident.protected_area_name || 'Unknown area'}
              <br />
              Severity: {incident.severity}
              <br />
              Risk: {Math.round(incident.risk_score || 0)}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IncidentMap;
