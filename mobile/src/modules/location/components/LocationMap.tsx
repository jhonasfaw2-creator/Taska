import { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Typography } from '@/components/ui';

interface LocationMapProps {
  userLocation?: { latitude: number; longitude: number } | null;
  pickupLocation?: { latitude: number; longitude: number } | null;
  dropoffLocation?: { latitude: number; longitude: number } | null;
  onMarkerSelect?: (latitude: number, longitude: number) => void;
  selectable?: boolean;
  style?: object;
}

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([9.02, 38.75], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var markers = {};
    var icons = {
      user: L.divIcon({ className: 'custom-marker', html: '<div style="background:#4F46E5;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      pickup: L.divIcon({ className: 'custom-marker', html: '<div style="background:#16A34A;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      dropoff: L.divIcon({ className: 'custom-marker', html: '<div style="background:#DC2626;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
    };
    function updateMarker(id, lat, lng, type) {
      if (markers[id]) { map.removeLayer(markers[id]); }
      if (!lat || !lng) return;
      markers[id] = L.marker([lat, lng], { icon: icons[type] || icons.user }).addTo(map);
    }
    map.on('click', function(e) {
      if (window.selectable) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng }));
      }
    });
    function fitBounds() {
      var bounds = L.latLngBounds();
      Object.keys(markers).forEach(function(k) { bounds.extend(markers[k].getLatLng()); });
      if (bounds.isValid()) { map.fitBounds(bounds.pad(0.2), { maxZoom: 16 }); }
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  </script>
</body>
</html>
`;

export default function LocationMap({
  userLocation,
  pickupLocation,
  dropoffLocation,
  onMarkerSelect,
  selectable = false,
  style,
}: LocationMapProps) {
  const webViewRef = useRef<any>(null);
  const htmlLoaded = useRef(false);
  const selectedMarker = useRef<{ latitude: number; longitude: number } | null>(null);

  const sendMapData = useCallback(() => {
    if (!webViewRef.current || !htmlLoaded.current) return;

    const selectableScript = selectable ? 'window.selectable = true;' : 'window.selectable = false;';

    const script = `
      (function() {
        ${selectableScript}
        updateMarker('user', ${userLocation ? userLocation.latitude : 'null'}, ${userLocation ? userLocation.longitude : 'null'}, 'user');
        updateMarker('pickup', ${pickupLocation ? pickupLocation.latitude : 'null'}, ${pickupLocation ? pickupLocation.longitude : 'null'}, 'pickup');
        updateMarker('dropoff', ${dropoffLocation ? dropoffLocation.latitude : 'null'}, ${dropoffLocation ? dropoffLocation.longitude : 'null'}, 'dropoff');
        setTimeout(fitBounds, 100);
      })();
    `;

    webViewRef.current.injectJavaScript(script);
  }, [userLocation, pickupLocation, dropoffLocation, selectable]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'ready') {
          htmlLoaded.current = true;
          sendMapData();
        } else if (msg.type === 'mapClick' && onMarkerSelect) {
          selectedMarker.current = { latitude: msg.lat, longitude: msg.lng };
          onMarkerSelect(msg.lat, msg.lng);
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [sendMapData, onMarkerSelect],
  );

  useEffect(() => {
    if (htmlLoaded.current) {
      sendMapData();
    }
  }, [sendMapData]);

  const handleNativeTap = useCallback(
    (evt: any) => {
      if (!selectable || !onMarkerSelect || !styles.container) return;
      const { locationX, locationY } = evt.nativeEvent;
      onMarkerSelect(9.03 + (locationY - 150) * 0.001, 38.74 + (locationX - 150) * 0.001);
    },
    [selectable, onMarkerSelect],
  );

  const renderNativeFallback = () => (
    <View style={[styles.fallbackContainer, style]} onTouchEnd={selectable ? handleNativeTap : undefined}>
      {userLocation && (
        <View style={[styles.marker, styles.userMarker]}>
          <View style={[styles.markerLabel, { backgroundColor: '#4F46E5' }]}>
            <View style={[styles.markerDot, { borderColor: '#ffffff' }]} />
          </View>
        </View>
      )}
      {pickupLocation && (
        <View style={[styles.marker, styles.pickupMarker, { top: '40%', left: '30%' }]}>
          <View style={[styles.markerLabel, { backgroundColor: '#16A34A' }]}>
            <View style={[styles.markerDot, { borderColor: '#ffffff' }]} />
          </View>
        </View>
      )}
      {dropoffLocation && (
        <View style={[styles.marker, styles.dropoffMarker, { top: '60%', left: '70%' }]}>
          <View style={[styles.markerLabel, { backgroundColor: '#DC2626' }]}>
            <View style={[styles.markerDot, { borderColor: '#ffffff' }]} />
          </View>
        </View>
      )}
      {selectable && (
        <View style={styles.selectableOverlay}>
          <Typography variant="caption" color="secondary" style={styles.selectableText}>
            Tap on the map to select a location
          </Typography>
        </View>
      )}
    </View>
  );

  if (Platform.OS === 'web') {
    return renderNativeFallback();
  }

  const renderWebView = () => {
    // Dynamic require to avoid breaking Expo Go if webview is unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const WebView = require('react-native-webview').WebView;

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: MAP_HTML }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scrollEnabled={false}
          style={{ backgroundColor: '#F3F4F6' }}
        />
      </View>
    );
  };

  try {
    return renderWebView();
  } catch {
    return renderNativeFallback();
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  fallbackContainer: { flex: 1, backgroundColor: '#F3F4F6', position: 'relative' },
  marker: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  markerLabel: { borderRadius: 9999, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  markerDot: { width: 14, height: 14, borderRadius: 9999, borderWidth: 3 },
  userMarker: { top: '50%', left: '50%', transform: [{ translateX: -9 }, { translateY: -9 }], zIndex: 3 },
  pickupMarker: { zIndex: 2 },
  dropoffMarker: { zIndex: 1 },
  selectableOverlay: { position: 'absolute', bottom: 12, left: 12, right: 12, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  selectableText: { color: '#FFFFFF', fontSize: 12 },
});
