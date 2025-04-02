// app/screens/profileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Ionicons,FontAwesome } from '@expo/vector-icons';
import { useLoadingState } from '../hooks/useLoadingState';


export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
  });
  const [userProducts, setUserProducts] = useState([]);
  const { loading, error, withLoading } = useLoadingState();

  useEffect(() => {
    fetchProfile();
    fetchUserProducts();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (error) throw error;
  
      // Fetch uploaded products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
  
      if (productsError) throw productsError;
  
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Could not load profile data.');
    }
  }; 

  const fetchUserProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Could not load your products');
    }
  };

  const handleImagePick = async () => {
    try {
      const image = await pickImage();
      if (image) {
        const imageUrl = await uploadImage(image.uri);
        setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };
const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

              if (error) throw error;

              setUserProducts(prevProducts => 
                prevProducts.filter(product => product.id !== productId)
              );
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }
  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.rating && (
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < item.rating ? "star" : "star-outline"}
                size={16}
                color="#FFD700"
              />
            ))}
          </View>
        )}
      </View>

    <View style={styles.productActions}>
    <TouchableOpacity 
        onPress={() => {
          if (item.id) {
            router.push({
              pathname: '/screens/editProduct',
              params: { id: item.id.toString() }
            });
          } else {
            Alert.alert('Error', 'Invalid product ID');
          }
        }}
        style={styles.editButton}
      >
        <Ionicons name="create-outline" size={24} color="#4CAF50" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => handleDeleteProduct(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#E63946" />
      </TouchableOpacity>
    </View>
    </View>
  );
  
  const openExternalLink = () => {
    Linking.openURL('https://www.google.com');
  };
 
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.bodycontainer}>
        <View style={styles.avatarheader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={isEditing ? handleImagePick : undefined}
          >
            {formData.avatar_url ? (
              <Image
                source={{ uri: formData.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
            {isEditing && (
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
              placeholder="Your name"
            />
          ) : (
            <Text style={styles.name}>{profile?.full_name}</Text>
          )}
        </View>

        <View>
          <Text style={styles.aboutText}>{profile?.username}</Text>
          <Text style={styles.aboutText}>{profile?.email}</Text>
        </View>
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>My Items</Text>
          {userProducts.length === 0 ? (
            <Text style={styles.noProducts}>You haven't posted any products yet</Text>
          ) : (
            <FlatList
              data={userProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
     <View style={styles.outside}>
        <TouchableOpacity
        style={styles.externalLinkButton}
        onPress={openExternalLink}
      >
        <Text style={styles.externalLinkText}>Edit Profile</Text>
        <FontAwesome name="external-link" size={16} color="#ccc" />
      </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
          <Ionicons name="log-out" size={24} color="#ccc" />
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
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
  bodycontainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  avatarheader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    color:'#5A4C77'
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5A4C77',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 12,
  },
  
  content: {
    paddingHorizontal: 16,
  },
  editButtonText: {
  color: '#ccc',
  fontWeight: 'bold',
},
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },uploadedItemsContainer: {
  marginTop: 20,
},
ratingContainer: {
    flexDirection: 'row',
    marginVertical: 5
  },
productsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#5A4C77',
    borderRadius: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productItem: {
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    fontWeight: 'bold',
    marginRight: 8,
    alignSelf: 'center',
    color: '#5A4C77'
  },
  deleteButton: {
    padding: 8,
  },
  noProducts: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
itemContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
},
deleteButtonText: {
  color: 'red',
  fontWeight: 'bold',
},
outside: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 5,

},
  externalLinkButton: {
    flexDirection: 'row',
    backgroundColor: '#5A4C77',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
    width: '50%'
  },
  externalLinkText: {
    fontWeight: 'bold',
    color: '#ccc',
    marginRight: 5
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E63946',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
    width: '50%'

  },
  logoutButtonText: {
    color: '#ccc',
    fontWeight: 'bold',
    marginRight: 5

  },
});
