// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from './lib/supabase';
import styles from './authentication'; // Import styles
import { useRouter } from 'expo-router';
import { signInWithGoogle } from './lib/auth';



const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();



 async function handleGoogleSignIn () {
    const response = await signInWithGoogle();
    if (response.success) {
      Alert.alert('Sign in successful!');
    } else {
      Alert.alert('Sign in failed:', response.message);
    }
  };


  async function signInWithEmail() {
    if (loading) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
          } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={24} color="#5A4C77" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={24} color="#5A4C77" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <LinearGradient
          colors={['#6A5B87', '#5A4C77']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity 
      style={styles.GoogleButton} 
      onPress={handleGoogleSignIn}
    >
      <LinearGradient
        colors={['#6A5B87', '#5A4C77']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          
          <Text style={styles.primaryButtonText}>Sign in with Google</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
    </View>
  );
}


export  default LoginScreen;