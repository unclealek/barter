// app/src/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Make sure you import your supabase client

export default function TabLayout() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        console.log("Fetched Products:", data);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };
    fetchProducts();
    
    const fetchSession = async () => {
      // Get current session status from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (session === null) {
    return null; // Render nothing until the session is fetched
  }

  // If not logged in, redirect to login or onboarding screen
  if (!session) {
    // You can redirect to the login screen or onboarding screen here
    return null; // For now, you can show nothing, or you can use a redirect like `router.push('/auth')`
  }

  
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#ff9800',
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="barter"
        options={{
          title: 'Barter',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="handshake-o" size={24} color={color} />
            
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Activities',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="address-card-o" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}