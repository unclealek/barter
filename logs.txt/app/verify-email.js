import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRouter } from 'expo-router';
import { resendVerificationEmail } from './lib/auth'; // Import the resend function
import { MaterialIcons } from '@expo/vector-icons';
//import styles from './authentication'; // Import styles


const VerificationScreen = () => {
  const router = useRouter();
  const userEmail = ""; // You can pass this as a route param or through state management

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
          <Text style={styles.tagline}>Just exchange it</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="mail-outline" size={64} color="#5A4C77" />
          </View>
          
          <Text style={styles.heading}>Verify your email</Text>
          
          <Text style={styles.message}>
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </Text>

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={24} color="#5A4C77" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              If you don't see the email, check your spam folder or click below to return to login once verified.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/welcome')}
          >
            <LinearGradient
              colors={['#6A5B87', '#5A4C77']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                Return to Login
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resendButton}
            oonPress={async () => {
              await handleResendVerification(); // Call the resend function
              Alert.alert('Verification email resent'); // Show alert after the function completes
               }}
          >

            <Text style={styles.resendButtonText}>
              Resend verification email
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(90, 76, 119, 0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5A4C77',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(90, 76, 119, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    color: '#5A4C77',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default VerificationScreen;