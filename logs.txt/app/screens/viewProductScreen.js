import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
 Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Carousel from "react-native-reanimated-carousel";
import { Rating } from "react-native-elements";

const { width } = Dimensions.get('window');

const ViewProductScreen = () => {
  const { product: productString } = useLocalSearchParams();
  const product = JSON.parse(productString);
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    loadOwnerDetails();
    checkIfFavorited();
  }, []);

  useEffect(() => {
    loadUserProducts();
  }, []);

  async function loadOwnerDetails() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', product.user_id)
        .single();

      if (error) throw error;
      setOwner(data);
    } catch (error) {
      console.error('Error loading owner details:', error.message);
      setOwner(null);
    }
  }

  async function checkIfFavorited() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const { data, error } = await supabase
        .from('favorite_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();
  
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
  
      if (data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }


  const handleFavoritePress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Please log in to save favorites');
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_products')
          .delete()
          .eq('id', favoriteId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const { data, error } = await supabase
          .from('favorite_products')
          .insert([
            {
              user_id: user.id,
              product_id: product.id,
            }, 
          ])
          .select('id')
          .single();

        if (error) throw error;
        setIsFavorite(true);
        setFavoriteId(data.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Unable to update favorites');
    }
  };

  async function loadUserProducts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProducts(data);
    } catch (error) {
      console.error('Error loading user products:', error.message);
    }
  }

  async function initiateBarterRequest(offeredProductId) {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/Login');
        return;
      }

      const { data: existingRequest, error: checkError } = await supabase
        .from('barter_requests')
        .select('*')
        .eq('requester_id', user.id)
        .eq('requested_product_id', validProduct.id)
        .eq('status', 'pending')
        .single();

      if (checkError && checkError.details !== 'Results contain 0 rows') throw checkError;

      if (existingRequest) {
        Alert.alert('Error', 'You already have a pending barter request for this product');
        return;
      }

      const { error } = await supabase
        .from('barter_requests')
        .insert({
          requester_id: user.id,
          owner_id: validProduct.user_id,
          requested_product_id: validProduct.id,
          offered_product_id: offeredProductId,
        });

      if (error) throw error;

      Alert.alert('Success', 'Barter request sent successfully');
      router.push('/BarterLinks');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  function showBarterOptions() {
    if (userProducts.length === 0) {
      Alert.alert('No Products', 'You need to add products before making a barter request', [
        { text: 'Add Product', onPress: () => router.push('/screens/addProductScreen') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    router.push({
      pathname: '/screens/barterProductScreen',
      params: { 
      products: JSON.stringify(userProducts), // Need to stringify complex objects
      requestedProductId: product.id,
      ownerId: product.user_id
    }
    });
  }

  const renderImage = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.image}
      resizeMode="cover"
      onError={(error) => console.error('Error loading image:', error.nativeEvent.error)}
      defaultSource={require('../assets/images/splash-icon.png')}  // Placeholder
    />
  );
  
  return (
    <ScrollView style={styles.container}>
     <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#FF4D4D' : '#333'} />
        </TouchableOpacity>
      </View>

     
      
      {/* Image Carousel */}
      <Carousel
        loop
        width={width}
        height={300}
        autoPlay
        data={product.images}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image source={{ uri: item }} style={styles.carouselImage} />
          </View>
        )}
      />

        <View style={styles.productInfo}>
          <Text style={styles.title}>{product.name}</Text>
          <Rating imageSize={20} readonly startingValue={product.rating} style={styles.rating} />
          <Text style={styles.rating}>{product.condition}</Text>
          {owner && (
            <View style={styles.ownerSection}>
              <Text style={styles.sectionTitle}>Owner: {owner.username}</Text>
            </View>
          )}
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.BarterButton, loading && styles.BarterButtonDisabled]} onPress={showBarterOptions} disabled={loading}>
      <LinearGradient
        colors={['#6A5B87', '#5A4C77']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.primaryButtonText}>{loading ? 'Processing...' : 'Make Barter Request'}</Text>
        </View>
      </LinearGradient>
      </TouchableOpacity>
      {/* / In ViewProductScreen.js
<TouchableOpacity
  style={styles.messageButton}
  onPress={async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // First create or get existing barter request
      const { data: barterRequest, error } = await supabase
        .from('barter_requests')
        .select('*')
        .eq('requested_product_id', product.id)
        .eq('requester_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let barterId;
      if (!barterRequest) {
        // Create a new barter request for messaging
        const { data: newRequest, error: insertError } = await supabase
          .from('barter_requests')
          .insert({
            requester_id: user.id,
            owner_id: product.user_id,
            requested_product_id: product.id,
            status: 'inquiry' // Add this status to your valid statuses
          })
          .select()
          .single();

        if (insertError) throw insertError;
        barterId = newRequest.id;
      } else {
        barterId = barterRequest.id;
      }

      router.push({
        pathname: '/screens/chat/chat',
        params: {
          barterId: barterId,
          otherUser: product.user_id
        }
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Alert.alert('Error', 'Unable to start chat. Please try again.');
    }
  }}
>
  <LinearGradient colors={['#5A4C77', '#4c669f']} style={styles.gradient}>
    <Text style={styles.messageButtonText}>Message Owner</Text>
  </LinearGradient>
</TouchableOpacity>
    */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
 header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 70,
    backgroundColor: "#6A5B87",
  },
  carouselImage: {
    width: width,
    height: 300,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  rating: {
    alignSelf: "flex-start",
    marginVertical: 10,
    backgroundColor: "#F5F5F5",
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
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
  BarterButton: {
    width: '50%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    alignSelf: 'center',
  },
  BarterButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ViewProductScreen;
