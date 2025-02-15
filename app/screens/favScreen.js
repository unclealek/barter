// app/screens/favScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch favorites for the logged-in user
  const fetchFavorites = async () => {
    try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session?.user) {
            console.log('No user session found');
            setLoading(false);
            return;
        }
        const userId = session.session.user.id;
        console.log('userId:', userId);

        const { data, error } = await supabase
            .from('favorite_products')
            .select(`
                *,
                products (
                    id,
                    name,
                    images,
                    rating,
                    user_id,
                    profiles (
                        username 
                    )
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching favorites:', error);
            throw error;
        }

        console.log('Fetched Favorites:', data); // Log the fetched favorites
        setFavorites(data || []);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    fetchFavorites();

    // Set up real-time subscription for favorites
    const favoritesSubscription = supabase
      .channel('favorites_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'favorite_products' 
        }, 
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      favoritesSubscription.unsubscribe();
    };
  }, []);

  const handleProductPress = (product) => {
    router.push({
      pathname: '/screens/viewProductScreen',
      params: { product: JSON.stringify(product) }
    });
  };

  const handleUnfavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorite_products')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      // Update the local state
      setFavorites(favorites.filter(item => item.id !== favoriteId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A4C77" />
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No favorite products yet!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => handleProductPress(item.products)}
          >
            <Image 
              source={{ uri: item.products.images[0] }} 
              style={styles.image}
              defaultSource={require('../assets/images/splash-icon.png')}
            />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>
                {item.products.name}
              </Text>
              
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < item.products.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              {item.products.sellers && (
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>Seller: {item.products.sellers.name}</Text>
                  <Text style={styles.sellerContact}>Contact: {item.products.sellers.contact_info}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.unfavoriteButton} 
              onPress={() => handleUnfavorite(item.id)}
            >
              <Ionicons name="trash" size={20} color="#FF4D4D" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  header: {
    paddingTop: 50,
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
  backButtonText: {
    color: '#ccc',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 12,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    marginLeft: 16,
    marginRight: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  unfavoriteButton: {
    padding: 10,
    backgroundColor: '#FF4D4D',
    borderRadius: 30,
    marginLeft: 10,
  },
  sellerInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
