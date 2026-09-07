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
import { defaults as defaultInteractions, MouseWheelZoom } from 'ol/interaction';
import { getParkCenter } from '../../data/parkCoordinates';
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

const OpenLayersMap = ({
  incidents = [],
  hotspots = [],
  parks = [],
  route = [],
  drawingMode = false,
  onMapClick = null,
  onFeatureClick = null,
  height = '16rem',
  className = '',
  center = ZIMBABWE_CENTER,
  zoom = 6,
  scrollWheelZoom = true,
  selectedId = null,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const popupOverlay = useRef(null);
  const popupContentRef = useRef(null);
  const layersRef = useRef({ hotspots: null, incidents: null, parks: null, route: null });
  const lastViewRef = useRef({ center: null, zoom: null });

  // Keep latest callbacks in refs so the one-time map click listener never goes stale
  const callbacksRef = useRef({ drawingMode, onMapClick, onFeatureClick });
  callbacksRef.current = { drawingMode, onMapClick, onFeatureClick };

  const hidePopup = useCallback(() => {
    if (popupOverlay.current) popupOverlay.current.setPosition(undefined);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return undefined;

    const hotspotSource = new VectorSource();
    const incidentSource = new VectorSource();
    const parkSource = new VectorSource();
    const routeSource = new VectorSource();

    const hotspotLayer = new VectorLayer({ source: hotspotSource, style: (f) => hotspotStyle(f.get('risk')) });
    const incidentLayer = new VectorLayer({ source: incidentSource, style: (f) => (f.get('selected') ? selectedStyle : incidentStyle) });
    const parkLayer = new VectorLayer({ source: parkSource, style: (f) => parkStyle(f.get('color') || '#666') });
    const routeLayer = new VectorLayer({ source: routeSource, style: (f) => (f.get('isLine') ? routeStyle : routePointStyle) });

    const popupEl = document.createElement('div');
    popupEl.className = 'ol-popup';
    popupEl.style.cssText = 'background:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.25);font-size:13px;max-width:220px;pointer-events:auto;position:relative;display:none;';
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'position:absolute;top:2px;right:6px;cursor:pointer;font-size:16px;color:#666;';
    closeBtn.onclick = () => {
      popupEl.style.display = 'none';
      if (popupOverlay.current) popupOverlay.current.setPosition(undefined);
    };
    popupEl.appendChild(closeBtn);
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'padding-top:4px;';
    popupEl.appendChild(contentDiv);
    popupContentRef.current = contentDiv;
    document.body.appendChild(popupEl);

    const overlay = new Overlay({ element: popupEl, autoPan: { animation: { duration: 250 } } });

    const initialCenter = Array.isArray(center) && center.length === 2 ? center : ZIMBABWE_CENTER;
    lastViewRef.current = { center: [...initialCenter], zoom };

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attributions: '© OpenStreetMap contributors',
          }),
        }),
        hotspotLayer,
        incidentLayer,
        parkLayer,
        routeLayer,
      ],
      view: new View({
        center: fromLonLat(initialCenter),
        zoom,
      }),
      overlays: [overlay],
      interactions: defaultInteractions({ mouseWheelZoom: scrollWheelZoom }),
    });

    map.on('click', (evt) => {
      const { drawingMode: liveDrawing, onMapClick: liveClick, onFeatureClick: liveFeatureClick } = callbacksRef.current;
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const html = feature.get('popup');
        if (html) {
          contentDiv.innerHTML = html;
          popupEl.style.display = 'block';
          overlay.setPosition(evt.coordinate);
        }
        if (liveFeatureClick) liveFeatureClick(feature.getProperties());
        return;
      }
      popupEl.style.display = 'none';
      overlay.setPosition(undefined);
      if (liveDrawing && liveClick) {
        const coords = toLonLat(evt.coordinate);
        liveClick({ lat: coords[1], lng: coords[0] });
      }
    });

    map.on('pointermove', (evt) => {
      if (evt.dragging) return;
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (mapRef.current) mapRef.current.style.cursor = feature ? 'pointer' : '';
    });

    mapInstance.current = map;
    popupOverlay.current = overlay;
    layersRef.current = { hotspots: hotspotSource, incidents: incidentSource, parks: parkSource, route: routeSource };

    // Map is often mounted inside a Modal (display:none -> 0 size).
    // Force a resize once layout settles so tiles/clicks align.
    const t1 = setTimeout(() => map.updateSize(), 50);
    const t2 = setTimeout(() => map.updateSize(), 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.setTarget(null);
      if (popupEl.parentNode) popupEl.parentNode.removeChild(popupEl);
      mapInstance.current = null;
      popupOverlay.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fix sizing when container class changes (e.g. modal opens) or window resizes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const t = setTimeout(() => map.updateSize(), 80);
    return () => clearTimeout(t);
  }, [className]);

  // Honour scrollWheelZoom prop (was previously accepted but ignored)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const hasWheel = map.getInteractions().getArray().some((i) => i instanceof MouseWheelZoom);
    if (scrollWheelZoom && !hasWheel) {
      map.addInteraction(new MouseWheelZoom());
    } else if (!scrollWheelZoom && hasWheel) {
      map.getInteractions().getArray()
        .filter((i) => i instanceof MouseWheelZoom)
        .forEach((i) => map.removeInteraction(i));
    }
  }, [scrollWheelZoom]);

  useEffect(() => {
    const src = layersRef.current.hotspots;
    if (!src) return;
    src.clear();
    hotspots.forEach((spot) => {
      const risk = spot.risk_score ?? spot.risk ?? 0;
      if (spot.lat == null || spot.lng == null) return;
      const f = new Feature({
        geometry: new Point(fromLonLat([spot.lng, spot.lat])),
        risk,
        popup: `<b>Risk: ${Math.round(risk)}%</b><br/>${spot.park ? `Park: ${spot.park}<br/>` : ''}${Number(spot.lat).toFixed(3)}, ${Number(spot.lng).toFixed(3)}`,
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
        selected: selectedId != null && selectedId === inc.id,
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
      // Prefer API center_point, fall back to hardcoded coords so markers
      // never stack at the Zimbabwe default when the DB has NULLs.
      const c = getParkCenter(p) || { lat: -19.0, lng: 29.5 };
      if (c.lat == null || c.lng == null) return;
      const f = new Feature({
        geometry: new Point(fromLonLat([c.lng, c.lat])),
        color: p.zone_type === 'national_park' ? '#1a5c2a' : p.zone_type === 'game_reserve' ? '#c9a84c' : p.zone_type === 'wildlife_sanctuary' ? '#2563eb' : '#7c3aed',
        popup: `<b>${p.name}</b><br/>${(p.zone_type || '').replace(/_/g, ' ')}<br/>Risk: ${p.risk_level || 'unknown'}<br/>Size: ${p.size_hectares ? (p.size_hectares / 100).toFixed(1) + ' km²' : 'N/A'}`,
      });
      src.addFeature(f);
    });
  }, [parks]);

  useEffect(() => {
    const src = layersRef.current.route;
    if (!src) return;
    src.clear();
    const valid = (route || []).filter((pt) => pt && pt.lat != null && pt.lng != null && Number.isFinite(Number(pt.lat)) && Number.isFinite(Number(pt.lng)));
    if (valid.length < 2) {
      valid.forEach((pt) => {
        src.addFeature(new Feature({ geometry: new Point(fromLonLat([Number(pt.lng), Number(pt.lat)])), isLine: false }));
      });
      return;
    }
    const coords = valid.map((pt) => fromLonLat([Number(pt.lng), Number(pt.lat)]));
    const lineFeature = new Feature({ geometry: new LineString(coords), isLine: true });
    src.addFeature(lineFeature);
    valid.forEach((pt, idx) => {
      const f = new Feature({ geometry: new Point(fromLonLat([Number(pt.lng), Number(pt.lat)])), isLine: false });
      f.set('popup', `Point ${idx + 1}`);
      src.addFeature(f);
    });
  }, [route]);

  // Only move the camera when center/zoom VALUES actually change.
  // (Previously a new array literal every render reset the user's pan/zoom
  // and made programmatic park zoom impossible.)
  // Destructured to primitives so the dep array never contains optional-chain
  // expressions (safer across transpilers) and array identity never matters.
  const centerLng = Array.isArray(center) ? center[0] : undefined;
  const centerLat = Array.isArray(center) ? center[1] : undefined;
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || centerLng == null || centerLat == null) return;
    const lng = Number(centerLng);
    const lat = Number(centerLat);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const prev = lastViewRef.current;
    const sameCenter = prev.center && Math.abs(prev.center[0] - lng) < 1e-9 && Math.abs(prev.center[1] - lat) < 1e-9;
    const sameZoom = prev.zoom === zoom;
    if (sameCenter && sameZoom) return;
    lastViewRef.current = { center: [lng, lat], zoom };
    const view = map.getView();
    view.animate({ center: fromLonLat([lng, lat]), zoom, duration: 450 });
  }, [centerLng, centerLat, zoom]);

  // Fit the view to the drawn/selected route so it is always visible
  useEffect(() => {
    const map = mapInstance.current;
    const src = layersRef.current.route;
    if (!map || !src) return;
    const extent = src.getExtent();
    if (!extent || extent.some((v) => !Number.isFinite(v))) return;
    if ((route || []).length >= 2) {
      map.getView().fit(extent, { padding: [24, 24, 24, 24], maxZoom: 12, duration: 350 });
      const c = map.getView().getCenter();
      const z = map.getView().getZoom();
      if (c) {
        try {
          const [lng, lat] = toLonLat(c);
          lastViewRef.current = { center: [lng, lat], zoom: z };
        } catch {
          /* ignore */
        }
      }
    }
  }, [route]);

  return (
    <div style={className ? undefined : { height }} className={`rounded-xl overflow-hidden border border-earth-200 ${className}`}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default OpenLayersMap;
