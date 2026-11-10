import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, RefreshCw, AlertTriangle, Cloud, MapPin } from 'lucide-react';
import { useApiDataEndpoint } from './hooks/useApiDataEndpoint';

// Colored SVG pins for High / Medium / Low severity and Cameras
const createDotIcon = (colorHex, size = 16) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${colorHex};width:${size}px;height:${size}px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 10px ${colorHex};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });

const ICONS = {
  high: createDotIcon('#ef4444', 18),
  medium: createDotIcon('#eab308', 15),
  low: createDotIcon('#22c55e', 14),
  selected: createDotIcon('#3b82f6', 22),
  camera: createDotIcon('#a855f7', 12)
};

function MapController({ selectedItem }) {
  const map = useMap();
  useEffect(() => {
    if (selectedItem?.latitude && selectedItem?.longitude) {
      map.flyTo([selectedItem.latitude, selectedItem.longitude], 14, {
        animate: true,
        duration: 0.75
      });
    }
  }, [selectedItem, map]);
  return null;
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [countyFilter, setCountyFilter] = useState('Wake');
  const [sortBy, setSortBy] = useState('time'); // Changed default to time (newest first)
  //const [sortBy, setSortBy] = useState('severity');
  const [showCameras, setShowCameras] = useState(true);
  const [activeCamera, setActiveCamera] = useState(null);
  const tileRefs = useRef({});

  const {
    data: incidents,
    isLoading,
    refetch
  } = useApiDataEndpoint('active-incidents', {
    limit: 150,
    county: countyFilter,
    sort: sortBy
  }, 60000);

  const { data: cameras } = useApiDataEndpoint('cameras', { limit: 250 }, 300000);

  const selectedIncident = incidents.find((inc) => inc.id === selectedId);

  const handleMarkerClick = (inc) => {
    setSelectedId(inc.id);
    tileRefs.current[inc.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const severityBadge = (sev) => {
    if (sev === 'high') return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (sev === 'medium') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* LEFT PANE: Interactive Wake County Map */}
      <div className="w-2/3 h-full relative">
        <MapContainer center={[35.7796, -78.6382]} zoom={11} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController selectedItem={selectedIncident} />

          {/* Incident Pins */}
          {incidents.map((inc) => (
            <Marker
              key={`inc-${inc.id}`}
              position={[inc.latitude, inc.longitude]}
              icon={inc.id === selectedId ? ICONS.selected : ICONS[inc.severity] || ICONS.low}
              eventHandlers={{ click: () => handleMarkerClick(inc) }}
            >
              <Popup>
                <div className="text-slate-900 text-xs space-y-1 max-w-xs">
                  <div className="font-bold text-sm">{inc.title}</div>
                  <div>{inc.description}</div>
                  <div className="text-slate-500 pt-1">
                    {new Date(inc.timestamp).toLocaleTimeString()} • {inc.county} County
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Camera Pins */}
          {showCameras &&
            cameras.map((cam) => (
              <Marker
                key={`cam-${cam.id}`}
                position={[cam.latitude, cam.longitude]}
                icon={ICONS.camera}
                eventHandlers={{ click: () => setActiveCamera(cam) }}
              />
            ))}
        </MapContainer>

        {/* Live Camera Overlay Card */}
        {activeCamera && (
          <div className="absolute bottom-5 left-5 z-[1000] w-96 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <Camera className="w-4 h-4" />
                <span className="truncate">{activeCamera.name}</span>
              </div>
              <button
                onClick={() => setActiveCamera(null)}
                className="text-xs text-slate-400 hover:text-white px-1.5"
              >
                ✕
              </button>
            </div>
            <img
              src={`${activeCamera.proxy_url}&cb=${Date.now()}`}
              alt={activeCamera.name}
              className="w-full h-56 object-cover bg-black"
            />
          </div>
        )}
      </div>

      {/* RIGHT PANE: Filter Bar & Scrollable Event Tiles */}
      <div className="w-1/3 h-full flex flex-col border-l border-slate-800 bg-slate-950">
        {/* Top Controls */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">PatrolX Live</h1>
              <p className="text-xs text-slate-400">{incidents.length} Active Events</p>
            </div>
            <button
              onClick={refetch}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Now"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="Wake">Wake County</option>
              <option value="all">All NC Counties</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="time">Sort: Newest First</option>
              <option value="severity">Sort: Severity</option>
            </select>

            <button
              onClick={() => setShowCameras((prev) => !prev)}
              className={`ml-auto px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${showCameras
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Cams
            </button>
          </div>
        </div>

        {/* Scrollable Event List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {incidents.length === 0 && !isLoading && (
            <div className="text-center text-slate-500 text-sm py-12">
              No active incidents matching filter.
            </div>
          )}

          {incidents.map((inc) => {
            const isSelected = inc.id === selectedId;
            return (
              <div
                key={inc.id}
                ref={(el) => (tileRefs.current[inc.id] = el)}
                onClick={() => setSelectedId(inc.id)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${isSelected
                  ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${severityBadge(
                      inc.severity
                    )}`}
                  >
                    {inc.source} • {inc.severity}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(inc.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-white mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{inc.roadway}</span>
                </h3>

                <div className="text-xs font-medium text-blue-300 mt-0.5">
                  {inc.decoded_nature}
                </div>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {inc.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {inc.county} Co.
                  </span>
                  {inc.weather_temp && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Cloud className="w-3 h-3" />
                      {inc.weather_temp}°F • {inc.weather_forecast}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}