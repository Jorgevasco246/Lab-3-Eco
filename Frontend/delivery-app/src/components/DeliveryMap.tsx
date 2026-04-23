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
  destination: { lat: number; lng: number } | null;
  onDelivered: () => void | Promise<void>;
}

export default function DeliveryMap({ orderId, destination, onDelivered }: Props) {
  const [position, setPosition] = useState({
    lat: 3.4516,
    lng: -76.532,
  });

  const throttleRef = useRef<number | null>(null);
  const pendingPosition = useRef(position);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`order:${orderId}`);
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId]);

  const updatePosition = useCallback(async (pos: { lat: number; lng: number }) => {
    await fetch(`${API_URL}/orders/${orderId}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pos),
    });

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'position-update',
        payload: pos,
      });
    }

    if (!destination) {
      return;
    }

    const res = await fetch(`${API_URL}/orders/${orderId}/check-arrival`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pos),
    });

    if (!res.ok) {
      return;
    }

    const { arrived } = await res.json();

    if (arrived) {
      await onDelivered();
    }
  }, [orderId, destination, onDelivered]);

  useEffect(() => {
    pendingPosition.current = position;
  }, [position]);

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`);
        if (!res.ok) {
          return;
        }

        const order = await res.json();
        const point = order.delivery_position;

        if (!ignore && typeof point?.lat === 'number' && typeof point?.lng === 'number') {
          const nextPosition = { lat: point.lat, lng: point.lng };
          setPosition(nextPosition);
          pendingPosition.current = nextPosition;
        }
      } catch {
        // Keep the default position if the order cannot be loaded yet.
      }
    };

    void loadOrder();

    return () => {
      ignore = true;
    };
  }, [orderId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }

      e.preventDefault();

      setPosition((prev) => {
        let { lat, lng } = prev;

        if (e.key === 'ArrowUp') lat += STEP;
        if (e.key === 'ArrowDown') lat -= STEP;
        if (e.key === 'ArrowLeft') lng -= STEP;
        if (e.key === 'ArrowRight') lng += STEP;

        const newPos = { lat, lng };
        pendingPosition.current = newPos;

        if (!throttleRef.current) {
          throttleRef.current = window.setTimeout(() => {
            void updatePosition(pendingPosition.current);
            throttleRef.current = null;
          }, 1000);
        }

        return newPos;
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (throttleRef.current) {
        window.clearTimeout(throttleRef.current);
      }
    };
  }, [updatePosition]);

  return (
    <div>
      <p>Usa las flechas del teclado para mover al repartidor.</p>
      <MapContainer
        key={orderId}
        center={[position.lat, position.lng]}
        zoom={15}
        style={{ height: '400px', width: '100%', background: 'white' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater position={position} />
        <Marker position={[position.lat, position.lng]} />
        {destination && <Marker position={[destination.lat, destination.lng]} />}
      </MapContainer>
    </div>
  );
}
