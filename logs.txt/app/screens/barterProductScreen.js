import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SelectProductScreen() {
  const router = useRouter();
  const { products, requestedProductId, ownerId } = useLocalSearchParams();
  const parsedProducts = JSON.parse(products);

  const handleSelect = async (offeredProductId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in to make a barter request');
        return;
      }

      // Check for existing pending request - Modified this part
      const { data: existingRequests, error: checkError } = await supabase
        .from('barter_requests')
        .select('*')
        .eq('requester_id', user.id)
        .eq('requested_product_id', requestedProductId)
        .eq('status', 'pending');

      if (checkError) {
        throw checkError;
      }

      // Check if there are any existing requests
      if (existingRequests && existingRequests.length > 0) {
        Alert.alert('Error', 'You already have a pending barter request for this product');
        return;
      }

      // Create new barter request
      const { error: insertError } = await supabase
        .from('barter_requests')
        .insert({
          requester_id: user.id,
          owner_id: ownerId,
          requested_product_id: requestedProductId,
          offered_product_id: offeredProductId,
          status: 'pending'
        });

      if (insertError) throw insertError;

      Alert.alert(
        'Success',
        'Barter request sent successfully',
        [
          {
            text: 'View Requests',
            onPress: () => router.push('/screens/barterScreen')
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating barter request:', error);
      Alert.alert('Error', 'Failed to create barter request. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a product to offer</Text>
      <FlatList
        data={parsedProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => handleSelect(item.id)}
          >
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
              defaultSource={require('../assets/images/favicon.png')}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productCategory}>{item.category}</Text>
              <Text style={styles.productCondition}>
                Condition: {item.condition}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  productItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productCondition: {
    fontSize: 14,
    color: '#444',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});