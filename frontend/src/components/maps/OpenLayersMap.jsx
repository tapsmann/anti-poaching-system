import React, { useEffect, useRef, useCallback } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Circle as CircleStyle, Fill, Stroke, Style, Text as TextStyle } from 'ol/style';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';

const ZIMBABWE_CENTER = [29.5, -19.0];

const getRiskColor = (risk) => {
  if (risk >= 70) return '#ef4444';
  if (risk >= 50) return '#f97316';
  if (risk >= 30) return '#eab308';
  return '#22c55e';
};

const getRiskRadius = (risk) => {
  if (risk >= 70) return 10;
  if (risk >= 50) return 7;
  if (risk >= 30) return 5;
  return 3;
};

const hotspotStyle = (risk) =>
  new Style({
    image: new CircleStyle({
      radius: getRiskRadius(risk),
      fill: new Fill({ color: getRiskColor(risk) + '99' }),
      stroke: new Stroke({ color: getRiskColor(risk), width: 1 }),
    }),
  });

const incidentStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: '#1a5c2a' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
  }),
});

const selectedStyle = new Style({
  image: new CircleStyle({
    radius: 9,
    fill: new Fill({ color: '#eab308' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
  }),
});

const parkStyle = (color) =>
  new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: color + 'aa' }),
      stroke: new Stroke({ color, width: 2 }),
    }),
  });

const routeStyle = new Style({
  stroke: new Stroke({ color: '#1a5c2a', width: 3, lineDash: [8, 6] }),
});

const routePointStyle = new Style({
  image: new CircleStyle({
    radius: 4,
    fill: new Fill({ color: '#1a5c2a' }),
    stroke: new Stroke({ color: '#fff', width: 1 }),
  }),
});

const drawingPointStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: '#ef4444' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
  }),
});

const OpenLayersMap = ({
  incidents = [],
  hotspots = [],
  parks = [],
  route = [],
  drawingMode = false,
  onMapClick = null,
  onFeatureClick = null,
  height = '16rem',
  center = ZIMBABWE_CENTER,
  zoom = 6,
  scrollWheelZoom = true,
  selectedId = null,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const popupOverlay = useRef(null);
  const layersRef = useRef({ hotspots: null, incidents: null, parks: null, route: null });

  const showPopup = useCallback((coordinate, html) => {
    if (!popupRef.current || !popupOverlay.current) return;
    popupRef.current.innerHTML = html;
    popupOverlay.current.setPosition(coordinate);
  }, []);

  const hidePopup = useCallback(() => {
    if (popupOverlay.current) popupOverlay.current.setPosition(undefined);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const hotspotSource = new VectorSource();
    const incidentSource = new VectorSource();
    const parkSource = new VectorSource();
    const routeSource = new VectorSource();

    const hotspotLayer = new VectorLayer({ source: hotspotSource, style: (f) => hotspotStyle(f.get('risk')) });
    const incidentLayer = new VectorLayer({ source: incidentSource, style: (f) => (f.get('selected') ? selectedStyle : incidentStyle) });
    const parkLayer = new VectorLayer({ source: parkSource, style: (f) => parkStyle(f.get('color') || '#666') });
    const routeLayer = new VectorLayer({ source: routeSource, style: (f) => f.get('isLine') ? routeStyle : routePointStyle });

    const popupEl = document.createElement('div');
    popupEl.className = 'ol-popup';
    popupEl.style.cssText = 'background:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.25);font-size:13px;max-width:220px;pointer-events:auto;position:relative;';
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '\u00d7';
    closeBtn.style.cssText = 'position:absolute;top:2px;right:6px;cursor:pointer;font-size:16px;color:#666;';
    closeBtn.onclick = hidePopup;
    popupEl.appendChild(closeBtn);
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'padding-top:4px;';
    popupEl.appendChild(contentDiv);
    document.body.appendChild(popupEl);

    const overlay = new Overlay({ element: popupEl, autoPan: false });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attributions: '\u00a9 OpenStreetMap contributors',
          }),
        }),
        hotspotLayer,
        incidentLayer,
        parkLayer,
        routeLayer,
      ],
      view: new View({
        center: fromLonLat(center),
        zoom,
      }),
      overlays: [overlay],
    });

    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const html = feature.get('popup');
        if (html) {
          contentDiv.innerHTML = html;
          showPopup(evt.coordinate, '');
          popupOverlay.current.setPosition(evt.coordinate);
        }
        if (onFeatureClick) onFeatureClick(feature.getProperties());
        return;
      }
      hidePopup();
      if (drawingMode && onMapClick) {
        const coords = toLonLat(evt.coordinate);
        onMapClick({ lat: coords[1], lng: coords[0] });
      }
    });

    map.on('pointermove', (evt) => {
      if (evt.dragging) return;
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      mapRef.current.style.cursor = feature ? 'pointer' : '';
    });

    mapInstance.current = map;
    popupOverlay.current = overlay;
    layersRef.current = { hotspots: hotspotSource, incidents: incidentSource, parks: parkSource, route: routeSource };

    return () => {
      map.setTarget(null);
      if (popupEl.parentNode) popupEl.parentNode.removeChild(popupEl);
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const src = layersRef.current.hotspots;
    if (!src) return;
    src.clear();
    hotspots.forEach((spot) => {
      const risk = spot.risk_score || spot.risk || 0;
      const f = new Feature({
        geometry: new Point(fromLonLat([spot.lng, spot.lat])),
        risk,
        popup: `<b>Risk: ${Math.round(risk)}%</b><br/>${spot.park ? `Park: ${spot.park}<br/>` : ''}${spot.lat.toFixed(3)}, ${spot.lng.toFixed(3)}`,
      });
      src.addFeature(f);
    });
  }, [hotspots]);

  useEffect(() => {
    const src = layersRef.current.incidents;
    if (!src) return;
    src.clear();
    incidents.filter((i) => i.latitude != null && i.longitude != null).forEach((inc) => {
      const risk = inc.risk_score || 0;
      const f = new Feature({
        geometry: new Point(fromLonLat([inc.longitude, inc.latitude])),
        selected: selectedId && selectedId !== inc.id,
        popup: `<b>${(inc.incident_type || '').replace(/_/g, ' ')}</b><br/>${inc.protected_area_name || 'Unknown area'}<br/>Severity: ${inc.severity}<br/>Risk: ${Math.round(risk)}%`,
      });
      src.addFeature(f);
    });
  }, [incidents, selectedId]);

  useEffect(() => {
    const src = layersRef.current.parks;
    if (!src) return;
    src.clear();
    parks.forEach((p) => {
      const c = p.center_point || { lat: -19.0, lng: 29.5 };
      const f = new Feature({
        geometry: new Point(fromLonLat([c.lng, c.lat])),
        color: p.zone_type === 'national_park' ? '#1a5c2a' : p.zone_type === 'game_reserve' ? '#c9a84c' : p.zone_type === 'wildlife_sanctuary' ? '#2563eb' : '#7c3aed',
        popup: `<b>${p.name}</b><br/>${(p.zone_type || '').replace(/_/g, ' ')}<br/>Risk: ${p.risk_level || 'unknown'}<br/>Size: ${p.size_hectares ? (p.size_hectares / 100).toFixed(1) + ' km\u00b2' : 'N/A'}`,
      });
      src.addFeature(f);
    });
  }, [parks]);

  useEffect(() => {
    const src = layersRef.current.route;
    if (!src) return;
    src.clear();
    if (route.length < 2) {
      route.forEach((pt) => {
        src.addFeature(new Feature({ geometry: new Point(fromLonLat([pt.lng, pt.lat])), isLine: false }));
      });
      return;
    }
    const coords = route.map((pt) => fromLonLat([pt.lng, pt.lat]));
    const lineFeature = new Feature({ geometry: new LineString(coords), isLine: true });
    src.addFeature(lineFeature);
    route.forEach((pt, idx) => {
      const f = new Feature({ geometry: new Point(fromLonLat([pt.lng, pt.lat])), isLine: false });
      f.set('popup', `Point ${idx + 1}`);
      src.addFeature(f);
    });
  }, [route]);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.getView().setCenter(fromLonLat(center));
    mapInstance.current.getView().setZoom(zoom);
  }, [center, zoom]);

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-earth-200">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default OpenLayersMap;
