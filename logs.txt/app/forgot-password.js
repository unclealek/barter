import React, { useState } from 'react';
import { View, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import { forgotPassword, resendVerificationEmail } from './lib/auth';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './authentication'; // Import styles


const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      Alert.alert('Success', response.message);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await resendVerificationEmail(email);
      Alert.alert('Success', response.message);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  

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
          <Text style={styles.formTitle}>Forgot Password</Text>
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color="#5A4C77" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6A5B87', '#5A4C77']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Sending...' : 'Reset Password'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleResendVerification}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6A5B87', '#5A4C77']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/welcome')}
          >
            <MaterialIcons name="arrow-back" size={20} color="#5A4C77" />
            <Text style={styles.backButtonText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </LinearGradient>
  );
};


export default ForgotPasswordScreen;