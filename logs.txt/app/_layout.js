// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';
import { useRouter } from 'expo-router';


export default function RootLayout() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);


  useEffect(() => {
    const initializeApp = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        setIsFirstLaunch(true);
        router.replace('/onboarding');  // Updated path
        return;
      } else {
        setIsFirstLaunch(false);
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      supabase.auth.onAuthStateChange((event, session) => {
        if (session && event === 'SIGNED_IN') {
          router.replace('/(tabs)/home');
        } else if (!session && event === 'SIGNED_OUT') {
          router.replace('/welcome');
        }
      });
    };

    initializeApp();
 // Listen to auth state changes
 const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
  if (!session) {
    router.replace('/onboarding');
  } else {
    router.replace('/(tabs)/home');
  }
});

return () => listener?.subscription.unsubscribe();
}, [router]);

  return (
    <Stack>
      <Stack.Screen name="onboarding"  options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
       <Stack.Screen name="screens/profileScreen" options={{ headerShown: false }} />
       <Stack.Screen name="screens/settingsScreen" options={{ headerShown: false }} />
       <Stack.Screen name="screens/addProductScreen" options={{ headerShown: false }} />
       <Stack.Screen name="editProduct" options={{ headerShown: false }} />
       <Stack.Screen name="screens/viewProductScreen" options={{ headerShown: false }} />
       <Stack.Screen name="screens/barterScreen" options={{ headerShown: false }} />
       <Stack.Screen name="screens/messageScreen" options={{ headerShown: false }} />
       <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="screens/favScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
