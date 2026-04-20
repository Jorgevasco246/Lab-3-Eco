import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  position: { lat: number; lng: number } | null;
  onSelect: (pos: { lat: number; lng: number }) => void;
}

function ClickHandler({ onSelect }: { onSelect: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({ position, onSelect }: Props) {
  return (
    <MapContainer
      center={[3.4516, -76.5320]}
      zoom={13}
      style={{ height: '300px', width: '100%', borderRadius: '16px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onSelect={onSelect} />
      {position && <Marker position={[position.lat, position.lng]} icon={icon} />}
    </MapContainer>
  );
}