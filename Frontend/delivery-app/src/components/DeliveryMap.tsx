import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { API_URL, supabase } from '../api/config';

const deliveryIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = L.divIcon({
  html: '📍',
  iconSize: [30, 30],
  className: 'destination-icon',
});

const STEP = 0.00005;

function MapUpdater({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.lat, position.lng]);
  }, [position, map]);
  return null;
}

interface Props {
  orderId: string;
  userId: string;
  destination: { lat: number; lng: number } | null;
  onDelivered: () => void;
}

export default function DeliveryMap({ orderId, userId, destination, onDelivered }: Props) {
  const [position, setPosition] = useState({ lat: 3.4516, lng: -76.5320 });
  const [delivered, setDelivered] = useState(false);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPosition = useRef(position);

  const updatePosition = async (pos: { lat: number; lng: number }) => {
    // 1. Actualizar en la base de datos
    await fetch(`${API_URL}/orders/${orderId}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: pos.lat, lng: pos.lng }),
    });

    // 2. Emitir via Supabase Broadcast
    const channel = supabase.channel(`order:${orderId}`);
    await channel.send({
      type: 'broadcast',
      event: 'position-update',
      payload: { lat: pos.lat, lng: pos.lng },
    });

    // 3. Verificar si llegó al destino
    if (destination) {
      const res = await fetch(`${API_URL}/orders/${orderId}/check-arrival`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pos.lat, lng: pos.lng }),
      });
      const data = await res.json();
      if (data.arrived && !delivered) {
        setDelivered(true);
        onDelivered();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let { lat, lng } = position;

      switch (e.key) {
        case 'ArrowUp':    lat += STEP; break;
        case 'ArrowDown':  lat -= STEP; break;
        case 'ArrowLeft':  lng -= STEP; break;
        case 'ArrowRight': lng += STEP; break;
        default: return;
      }

      e.preventDefault();
      setPosition({ lat, lng });
      pendingPosition.current = { lat, lng };

      if (throttleRef.current) return;

      throttleRef.current = setTimeout(() => {
        updatePosition(pendingPosition.current);
        throttleRef.current = null;
      }, 1000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [position]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-500 font-medium text-center">
        Usa las teclas ↑ ↓ ← → para moverte en el mapa
      </div>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '16px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater position={position} />
        <Marker position={[position.lat, position.lng]} icon={deliveryIcon} />
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        )}
      </MapContainer>
      <div className="text-xs text-gray-400 text-center font-medium">
        Tu posición: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
      </div>
    </div>
  );
}