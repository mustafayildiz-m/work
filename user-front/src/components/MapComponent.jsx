'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Leaflet'i sadece client-side'da import et
let L;
let leafletCSS;

if (typeof window !== 'undefined') {
  L = require('leaflet');
}

// Fix for default markers in Leaflet (sadece client-side'da)
if (typeof window !== 'undefined' && L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const MapComponent = ({ latitude, longitude, locationName, title = "Konum" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current || !L) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    // Initialize map with 3D-like styling
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: false, // We'll add custom controls
      attributionControl: false
    });

    // Add beautiful OpenStreetMap tiles with custom styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 3,
    }).addTo(map);

    // Add custom 3D-style zoom controls
    const zoomControl = L.control.zoom({
      position: 'topright',
      zoomInTitle: 'Yakınlaştır',
      zoomOutTitle: 'Uzaklaştır'
    }).addTo(map);

    // Custom 3D Marker with pulse effect
    const customIcon = L.divIcon({
      className: 'custom-3d-marker',
      html: `
        <div class="marker-container">
          <div class="marker-pulse"></div>
          <div class="marker-pulse-2"></div>
          <div class="marker-icon">
            <div class="marker-inner">
              <i class="fas fa-map-marker-alt"></i>
            </div>
          </div>
          <div class="marker-shadow"></div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });

    // Add marker with popup
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    
    // Create beautiful 3D-style popup
    const popupContent = `
      <div class="popup-3d">
        <div class="popup-header">
          <div class="popup-icon">📍</div>
          <h4>${title}</h4>
        </div>
        <div class="popup-body">
          <p class="location-name">${locationName || 'Konum bilgisi'}</p>
          <div class="coordinates">
            <span class="coord-label">Koordinatlar:</span>
            <span class="coord-value">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Store map instance
    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [latitude, longitude, locationName, title]);

  if (!latitude || !longitude) {
    return (
      <div className="text-center py-4">
        <div className="text-muted">
          <i className="fas fa-map-marker-alt fa-2x mb-2"></i>
          <p>Konum bilgisi bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-3d-container">
      <div 
        ref={mapRef} 
        className="map-3d"
        style={{ 
          height: '500px', 
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '2px solid rgba(255,255,255,0.1)',
          position: 'relative'
        }}
      />
      
      <style jsx>{`
        .map-3d-container {
          margin: 20px 0;
          position: relative;
        }
        
        .map-3d {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        /* 3D Marker Styling */
        :global(.custom-3d-marker) {
          position: relative;
          width: 50px;
          height: 50px;
        }
        
        :global(.marker-container) {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        :global(.marker-pulse) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        :global(.marker-pulse-2) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: rgba(118, 75, 162, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite 0.5s;
        }
        
        :global(.marker-icon) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        :global(.marker-inner) {
          color: white;
          font-size: 18px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        :global(.marker-shadow) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 20px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.2) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 1;
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        /* 3D Popup Styling */
        :global(.leaflet-popup-content-wrapper) {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          padding: 0;
          overflow: hidden;
        }
        
        :global(.leaflet-popup-tip) {
          background: rgba(255, 255, 255, 0.95);
        }
        
        :global(.popup-3d) {
          padding: 0;
        }
        
        :global(.popup-header) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          position: relative;
        }
        
        :global(.popup-icon) {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        :global(.popup-header h4) {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        :global(.popup-body) {
          padding: 20px;
          text-align: center;
        }
        
        :global(.location-name) {
          color: #666;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        :global(.coordinates) {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        :global(.coord-label) {
          font-size: 12px;
          color: #999;
          font-weight: 500;
        }
        
        :global(.coord-value) {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 13px;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        /* Leaflet Zoom Controls */
        :global(.leaflet-control-zoom) {
          border: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-radius: 12px;
          overflow: hidden;
        }
        
        :global(.leaflet-control-zoom a) {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          color: #667eea;
          border: none;
          border-radius: 0;
          margin: 0;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 18px;
          font-weight: bold;
        }
        
        :global(.leaflet-control-zoom a:hover) {
          background: #667eea;
          color: white;
          transform: scale(1.05);
        }
        
        :global(.leaflet-control-zoom a:first-child) {
          border-radius: 12px 12px 0 0;
        }
        
        :global(.leaflet-control-zoom a:last-child) {
          border-radius: 0 0 12px 12px;
        }
        
        /* Map Canvas Styling */
        :global(.leaflet-container) {
          border-radius: 16px;
        }
        
        /* Attribution Styling */
        :global(.leaflet-control-attribution) {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 11px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
