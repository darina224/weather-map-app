import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const LayerPanel = ({ onLayerSelect, activeLayer }) => {
  const layers = [
    { id: 'temp', emoji: '🌡️', name: 'Температура' },
    { id: 'precip', emoji: '🌧️', name: 'Осадки' },
    { id: 'wind', emoji: '💨', name: 'Ветер' },
    { id: 'clouds', emoji: '☁️', name: 'Облачность' },
    { id: 'pressure', emoji: '📊', name: 'Давление' },
  ];

  return (
    <View style={styles.panel}>
      {layers.map(layer => (
        <TouchableOpacity 
          key={layer.id}
          style={[styles.button, activeLayer === layer.id && styles.activeButton]}
          onPress={() => onLayerSelect(layer.id)}
        >
          <Text style={styles.buttonEmoji}>{layer.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#d0d0d0',
    borderWidth: 2,
    borderColor: '#999',
  },
  buttonEmoji: {
    fontSize: 24,
  },
});

export default LayerPanel;