// app/src/onboarding.js
// This is the onboarding screen that will be shown to new users when they first open the app.
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  {
    title: "Welcome to Barter",
    description: "The easiest way to exchange items with people around you",
  },
  {
    title: "Find Items",
    description: "Browse through a wide variety of items available for exchange",
  },
  {
    title: "Make Exchanges",
    description: "Connect with others and trade items seamlessly",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const translateX = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler((event) => {
    translateX.value = event.contentOffset.x;
  });

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/welcome');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {ONBOARDING_SCREENS.map((screen, index) => (
          <View key={index} style={[styles.screen, { width: SCREEN_WIDTH }]}>            
            <Text style={styles.title}>{screen.title}</Text>
            <Text style={styles.description}>{screen.description}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_SCREENS.map((_, index) => {
            const dotStyle = useAnimatedStyle(() => {
              const input = translateX.value / SCREEN_WIDTH;
              const opacity = interpolate(
                input,
                [index - 1, index, index + 1],
                [0.5, 1, 0.5],
                'clamp'
              );
              const scale = interpolate(
                input,
                [index - 1, index, index + 1],
                [1, 1.25, 1],
                'clamp'
              );

              return {
                opacity,
                transform: [{ scale }],
              };
            });

            return (
              <Animated.View key={index} style={[styles.dot, dotStyle]} />
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={finishOnboarding}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A4C77',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5A4C77',
    marginHorizontal: 4,
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
  },
});
