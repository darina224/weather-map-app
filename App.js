import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { cities } from './cities';
import LayerPanel from './LayerPanel';
import { getYandexWeather, getWeatherEmoji } from './weatherAPI';

export default function App() {
  const mapRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('temp');
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeatherForAllCities();
  }, []);

  const loadWeatherForAllCities = async () => {
    setLoading(true);
    const weatherMap = {};
    let hasError = false;
    
    for (const city of cities) {
      const data = await getYandexWeather(city.latitude, city.longitude);
      if (data) {
        weatherMap[city.id] = data;
      } else {
        hasError = true;
      }
    }
    
    if (Object.keys(weatherMap).length === 0 && hasError) {
      setError('Не удалось загрузить данные о погоде');
    } else {
      setWeatherData(weatherMap);
    }
    setLoading(false);
  };

  const centerMap = () => {
    mapRef.current.animateToRegion({
      latitude: 55.751244,
      longitude: 37.618423,
      latitudeDelta: 5,
      longitudeDelta: 5,
    }, 1000);
  };

  const showAllMarkers = () => {
    mapRef.current.fitToCoordinates(
      cities.map(c => ({ latitude: c.latitude, longitude: c.longitude })),
      {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      }
    );
  };

  const renderMarkerContent = (city) => {
    const weather = weatherData[city.id];
    if (!weather || !weather.fact) {
      return (
        <View style={styles.customMarker}>
          <View style={styles.markerDot} />
          <Text style={styles.markerText}>{city.name}</Text>
        </View>
      );
    }

    const fact = weather.fact;
    
    switch(activeLayer) {
      case 'temp':
        const tempColor = fact.temp <= 0 ? '#00BFFF' : fact.temp <= 15 ? '#FFA500' : '#FF4500';
        return (
          <View style={[styles.tempMarker, { backgroundColor: tempColor }]}>
            <Text style={styles.tempText}>{Math.round(fact.temp)}°</Text>
            <Text style={styles.cityNameSmall}>{city.name}</Text>
          </View>
        );
      case 'precip':
        const precipEmoji = fact.precip_mm > 0 ? (fact.precip_type === 'snow' ? '❄️' : '🌧️') : '☀️';
        return (
          <View style={styles.precipMarker}>
            <Text style={styles.precipEmoji}>{precipEmoji}</Text>
            <Text style={styles.markerText}>{city.name}</Text>
            {fact.precip_mm > 0 && <Text style={styles.precipText}>{fact.precip_mm} mm</Text>}
          </View>
        );
      case 'wind':
        const windDir = getWindArrow(fact.wind_dir);
        return (
          <View style={styles.windMarker}>
            <Text style={styles.windArrow}>{windDir}</Text>
            <Text style={styles.windSpeed}>{Math.round(fact.wind_speed)} м/с</Text>
            <Text style={styles.cityNameSmall}>{city.name}</Text>
          </View>
        );
      case 'clouds':
        const opacity = fact.cloudness / 100;
        return (
          <View style={[styles.cloudMarker, { opacity: Math.max(0.3, opacity) }]}>
            <Text style={styles.cloudEmoji}>☁️</Text>
            <Text style={styles.markerText}>{city.name}</Text>
          </View>
        );
      case 'pressure':
        const pressureMmHg = Math.round(fact.pressure_mm);
        return (
          <View style={[styles.pressureMarker, { backgroundColor: pressureMmHg < 740 ? '#87CEEB' : pressureMmHg > 760 ? '#FF6347' : '#98FB98' }]}>
            <Text style={styles.pressureText}>{pressureMmHg}</Text>
            <Text style={styles.cityNameSmall}>{city.name}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.customMarker}>
            <View style={styles.markerDot} />
            <Text style={styles.markerText}>{city.name}</Text>
          </View>
        );
    }
  };

  const getWindArrow = (dir) => {
    const arrows = {
      'nw': '↖️', 'n': '⬆️', 'ne': '↗️',
      'w': '⬅️', 'e': '➡️',
      'sw': '↙️', 's': '⬇️', 'se': '↘️'
    };
    return arrows[dir.toLowerCase()] || '➡️';
  };

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
        {renderMarkerContent(city)}
      </Marker>
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Прогноз погоды</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#333" />
          <Text>Загрузка погоды...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && Object.keys(weatherData).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Прогноз погоды</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Проверьте подключение к интернету</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Прогноз погоды</Text>
      </View>
      
      <View style={styles.leftButtons}>
        <TouchableOpacity style={styles.button} onPress={centerMap}>
          <Text style={styles.buttonEmoji}>🎯</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={showAllMarkers}>
          <Text style={styles.buttonEmoji}>🗺️</Text>
        </TouchableOpacity>
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
      <LayerPanel onLayerSelect={setActiveLayer} activeLayer={activeLayer} />
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
  leftButtons: {
    position: 'absolute',
    top: 100,
    left: 10,
    flexDirection: 'row',
    zIndex: 1,
  },
  button: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonEmoji: {
    fontSize: 24,
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
  tempMarker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tempText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  precipMarker: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  precipEmoji: {
    fontSize: 24,
  },
  precipText: {
    fontSize: 10,
    color: '#333',
  },
  windMarker: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  windArrow: {
    fontSize: 24,
  },
  windSpeed: {
    fontSize: 12,
    color: '#333',
  },
  cloudMarker: {
    backgroundColor: '#808080',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  cloudEmoji: {
    fontSize: 24,
  },
  pressureMarker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pressureText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cityNameSmall: {
    fontSize: 10,
    color: 'white',
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
});