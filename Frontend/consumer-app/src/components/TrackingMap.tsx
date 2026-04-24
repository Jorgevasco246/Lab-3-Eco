import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL, supabase } from '../api/config';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const deliveryIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = L.divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:9999px;background:#ef4444;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(239,68,68,0.35);"></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: 'destination-icon',
});

function MapUpdater({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng]);
  }, [position, map]);

  return null;
}

interface Props {
  orderId: string;
  destination: { lat: number; lng: number } | null;
  onArrived: () => void;
}

export default function TrackingMap({ orderId, destination, onArrived }: Props) {
  const [deliveryPosition, setDeliveryPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [arrived, setArrived] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const arrivedRef = useRef(false);
  const onArrivedRef = useRef(onArrived);

  useEffect(() => {
    onArrivedRef.current = onArrived;
  }, [onArrived]);

  const checkArrival = useCallback((lat: number, lng: number) => {
    if (!destination || arrivedRef.current) {
      return;
    }

    const earthRadius = 6371000;
    const dLat = ((lat - destination.lat) * Math.PI) / 180;
    const dLng = ((lng - destination.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((destination.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    if (distance < 5) {
      arrivedRef.current = true;
      setArrived(true);
      onArrivedRef.current();
    }
  }, [destination]);

  useEffect(() => {
    let ignore = false;

    const loadPosition = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`);
        if (!res.ok) {
          return;
        }

        const order = await res.json();
        const point = order.delivery_position;

        if (!ignore && typeof point?.lat === 'number' && typeof point?.lng === 'number') {
          setDeliveryPosition({ lat: point.lat, lng: point.lng });
          checkArrival(point.lat, point.lng);
        }
      } catch {
        // Ignore the initial fetch error; broadcast can still recover the view.
      }
    };

    const channel = supabase.channel(`order:${orderId}`);
    channel
      .on('broadcast', { event: 'position-update' }, ({ payload }) => {
        const { lat, lng } = payload as { lat?: number; lng?: number };

        if (typeof lat === 'number' && typeof lng === 'number') {
          setDeliveryPosition({ lat, lng });
          checkArrival(lat, lng);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSocketStatus('connected');
        } else {
          setSocketStatus('disconnected');
        }
      });

    void loadPosition();

    return () => {
      ignore = true;
      setSocketStatus('disconnected');
      void supabase.removeChannel(channel);
    };
  }, [orderId, checkArrival]);

  const center = deliveryPosition || destination || { lat: 3.4516, lng: -76.532 };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            socketStatus === 'connected'
              ? 'bg-green-100 text-green-700'
              : socketStatus === 'connecting'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-600'
          }`}
        >
          {socketStatus === 'connected' ? 'Socket activo' : socketStatus === 'connecting' ? 'Conectando socket' : 'Socket desconectado'}
        </span>
      </div>
      {arrived && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-2xl font-black text-center">
          El repartidor ha llegado a tu ubicacion.
        </div>
      )}
      {!deliveryPosition && (
        <div className="bg-orange-50 border-2 border-orange-200 text-orange-600 px-4 py-3 rounded-2xl font-medium text-center text-sm">
          Esperando que el repartidor inicie el movimiento...
        </div>
      )}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: '350px', width: '100%', borderRadius: '16px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {deliveryPosition && (
          <>
            <MapUpdater position={deliveryPosition} />
            <Marker position={[deliveryPosition.lat, deliveryPosition.lng]} icon={deliveryIcon} />
          </>
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        )}
      </MapContainer>
    </div>
  );
}
