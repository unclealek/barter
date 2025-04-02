
// SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from './lib/supabase';
import { useRouter } from 'expo-router';
import styles from './authentication'; // Import styles
import { signUpWithGoogle } from './lib/auth';



const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();



  const handleGoogleSignUp = async () => {
    const response = await signUpWithGoogle();
    if (response.success) {
      Alert.alert('Sign up successful!');
    } else {
      Alert.alert('Sign up failed:', response.message);
    }
  };

  

  async function signUpWithEmail() {
    if (loading) return;
    
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, username, email }]);

      if (profileError) throw profileError;

      Alert.alert('Success', 'Please check your email for verification');
      router.replace('verify-email');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <MaterialIcons name="person" size={24} color="#5A4C77" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
        />
      </View>

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
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <LinearGradient
          colors={['#6A5B87', '#5A4C77']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity 
      style={styles.GoogleButton} 
      onPress={signUpWithGoogle}
    >
      <LinearGradient
        colors={['#6A5B87', '#5A4C77']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          
          <Text style={styles.primaryButtonText}>SignUp with Google</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
    </View>
  );
}


  export  default SignUpScreen;;