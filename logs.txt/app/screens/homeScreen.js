import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshControl,
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { useRefresh } from '../hooks/useRefresh';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  const { refreshing, onRefresh } = useRefresh(loadProducts);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadProducts(),
          loadFavorites(),
          fetchCategories(),
        ]);
      } catch (error) {
        setError('Failed to load initial data');
        console.error('Initialization error:', error);
      }
    };

    initializeData();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      setError('Failed to load categories');
    }
  };

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select(`*, profiles:user_id (username)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error.message);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorite_products')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data.map(fav => fav.product_id));
    } catch (error) {
      console.error('Error loading favorites:', error.message);
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleProductPress = (products) => {
    router.push({
      pathname: '/screens/viewProductScreen',
      params: { product: JSON.stringify(products) }
    });
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleRetry = async () => {
    setError(null);
    await loadProducts();
  };


  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => handleProductPress(item)} 
      activeOpacity={0.9}
      accessible={true}
      accessibilityLabel={`${item?.name} product card`}
      accessibilityRole="button"
    >
      <Image 
        source={{ uri: item?.images?.[0] || null  }} 
        style={styles.productImage}
        defaultSource={require('../assets/images/splash-icon.png')}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
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
        <Text style={styles.sellerName}>
          Added {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => {
    if (!item || !item.id) return null; // Add null check

    return (
    <TouchableOpacity
      onPress={() => handleCategorySelect(item.id)}
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.activeCategory
      ]}
      accessible={true}
      accessibilityLabel={`${item.name} category`}
      accessibilityRole="button"
    >
      <View style={styles.categoryContent}>
      <Ionicons name={item.icon || 'folder-outline' }
      size={24} color="white"
      style={styles.categoryIcon} />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.activeCategoryText
      ]}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <LinearGradient
      colors={['#6A5B87', '#5A4C77', '#4A3D67']}
      style={styles.gradientHeader}
    >
    <BlurView intensity={20} style={styles.searchContainer}>
      <Ionicons name="search" size={24} color="#ccc" style={styles.searchIcon}/>
      <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search products"
            accessibilityHint="Enter text to search for products"
          />
    </BlurView>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => (item?.id ?? '').toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />
        </LinearGradient>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => `product-${item?.id || Math.random()}`}
        numColumns={2}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#666"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={50} color="#666" />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'No products found matching your search'
                : 'No products available'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/screens/addProductScreen')}
        accessible={true}
        accessibilityLabel="Add new product"
        accessibilityRole="button"
      >
        <View style={styles.fabContent}>
          <FontAwesome name="plus" size={24} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8"
  },
  gradientHeader: {
    paddingTop: 70,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 35,
    paddingHorizontal: 15,
    marginBottom: 20
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 10
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoriesContainer: {
    marginBottom: 10
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 100,
  },
  categoryIcon: {
    marginRight: 8,
  },
  activeCategory: {
    backgroundColor: "rgba(255, 255, 255, 0.3)"
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 4
  },
  activeCategoryText: {
    fontWeight: "bold"
  },
  productList: {
    padding: 10
  },
  productCard: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover"
  },
  productInfo: {
    padding: 10
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    height: 40
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 5
  },
  sellerName: {
    fontSize: 12,
    color: "#777",
    marginTop: 5
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 10
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#5A4C77',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#ff9800",
    shadowOffset: { width: 10, height: 30},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
