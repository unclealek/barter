// app/screens/settingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Favorites',
      icon: 'heart',
      onPress: () => router.push('/screens/favScreen'),
    },
    {
      title: 'Add Product',
      icon: 'add-circle',
      onPress: () => router.push('/screens/addProductScreen'),
    },
    {
      title: 'Support',
      icon: 'help-circle',
      onPress: () => router.push('https://anthropomass.org/reshaping/'),
    },
    {
      title: 'Invite a Friend',
      icon: 'person-add',
      onPress: () => router.push('https://anthropomass.org/reshaping/'),
    },
    {
      title: 'Sign Out',
      icon: 'log-out',
      onPress: async () => {
        await supabase.auth.signOut();
        await clearLocalStorage(); 
        router.replace('/onboarding');
      },
    },
  ];

  const renderMenuItem = ({ title, icon, onPress }) => (
    <TouchableOpacity key={title} style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Ionicons name={icon} size={24} color="#5A4C77" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ff9800" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        </TouchableOpacity>
        
      </View>
      <View style={styles.settings}>
      <Text style={styles.title}></Text>
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/screens/profileScreen')}
        >
          <Ionicons name="person-circle" size={50} color="#5A4C77" />
          <Text style={styles.profileText}>View Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.menu}>
        {menuItems.map(renderMenuItem)}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A4C77',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transform: [{ scale: 1 }],
  },
  settings: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileButton: {
    alignItems: 'center',
  },
  profileText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '800',
    color: '#5A4C77',
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
    fontWeight: '500',
  },
});