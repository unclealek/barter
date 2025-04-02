// app/src/App.js
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';


export default function App() {
  const router = useRouter();

  return (
<View style={styles.container}>
      <Text style={styles.title}>Barter</Text>
      <Text style={styles.subtitle}>Just exchange it</Text>
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => router.push('/welcome')}
        >
        <Text style={styles.primaryButtonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  );
}

// Shared styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5A4C77',
    textShadowColor: '#AAA',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
  },
  primaryButton: {
  width: '70%',
  height: 45,
  backgroundColor: '#5A4C77',
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 15,
},
primaryButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
}
});