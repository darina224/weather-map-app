import React, { useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { cities } from './cities';

export default function App() {
  const mapRef = useRef(null);

  const renderMarkers = () => {
    return cities.map(city => (
      <Marker
        key={city.id}
        coordinate={{
          latitude: city.latitude,
          longitude: city.longitude,
        }}
        title={city.name}
      >
        <View style={styles.customMarker}>
          <View style={styles.markerDot} />
          <Text style={styles.markerText}>{city.name}</Text>
        </View>
      </Marker>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Прогноз погоды</Text>
      </View>
      <View style={styles.content}>
        <MapView 
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 55.751244,
            longitude: 37.618423,
            latitudeDelta: 5,
            longitudeDelta: 5,
          }}
        >
          {renderMarkers()}
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    marginBottom: 2,
  },
  markerText: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
  },
});