// WelcomeScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import LoginScreen from './login';
import SignUpScreen from './sign-up';
import styles from './authentication'; // Import styles


export default function WelcomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');

  return (
    <LinearGradient
      colors={['#6A5B87', '#5A4C77', '#4A3D67']}
      style={styles.container}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Barter</Text>
          <Text style={styles.subtitle}>Just exchange it</Text>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'sign-up' && styles.activeTab]}
              onPress={() => setActiveTab('sign-up')}
            >
              <Text style={[styles.tabText, activeTab === 'sign-up' && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'login' ? <LoginScreen /> : <SignUpScreen />}
          
          <TouchableOpacity 
            style={styles.forgotButton}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotButtonText}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </LinearGradient>
  );
}

