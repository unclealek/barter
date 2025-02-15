// components/EmptyState.js
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export function EmptyState({ message, icon }) {
    return (
      <View style={styles.container}>
        <Ionicons name={icon} size={50} color="#666" />
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 10,
    },
    message: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
    emptyText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
  });