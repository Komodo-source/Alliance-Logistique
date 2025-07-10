import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LeafletMap = ({ latitude = 9.3077, longitude = 2.3158, selectable = false, onLocationChange, onMapTouchStart, onMapTouchEnd }) => {
  const webViewRef = useRef(null);

  // Build the JS for selectable mode
  const selectableJS = `
    function updateMarker(lat, lng) {
      marker.setLatLng([lat, lng]);
      window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
    }
    map.on('click', function(e) {
      updateMarker(e.latlng.lat, e.latlng.lng);
    });
    marker.on('dragend', function(e) {
      var latlng = marker.getLatLng();
      updateMarker(latlng.lat, latlng.lng);
    });
  `;

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style> html, body, #map { height: 100%; margin: 0; padding: 0; } </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView([${latitude}, ${longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);
        var marker = L.marker([${latitude}, ${longitude}], {draggable: ${selectable}}).addTo(map);
        ${selectable ? selectableJS : ''}
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (onLocationChange) {
        onLocationChange(data);
      }
    } catch (e) {
      // Ignore
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={true}
        automaticallyAdjustContentInsets={false}
        mixedContentMode="always"
        onTouchStart={onMapTouchStart}
        onTouchEnd={onMapTouchEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default LeafletMap;
