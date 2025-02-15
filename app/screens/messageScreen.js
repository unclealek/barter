// app/screens/messageScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function InboxScreen() {
  const [barterChats, setBarterChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [barterDetails, setBarterDetails] = useState(null);


  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchBarterChats();

      const subscription = supabase
        .channel('barter_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          () => {
            fetchBarterChats();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);

  const fetchBarterChats = async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('barter_messages_view')
        .select(`
          *,
          requested_product:requested_product_id (name, images),
          offered_product:offered_product_id (name, images)
        `)
        .or(`requester_id.eq.${currentUser.id},owner_id.eq.${currentUser.id}`)
        .order('latest_message_time', { ascending: false });
  
      if (error) throw error;
      
      // Transform the data to match your component's expectations
      const transformedData = data.map(chat => ({
        id: chat.barter_request_id,
        status: chat.barter_status || 'pending' ,
        requester_id: chat.requester_id,
        owner_id: chat.owner_id,
        requester_name: chat.requester_name || 'Unknown User',  
        owner_name: chat.owner_name || 'Unknown User',  
        latest_message: chat.content,
        latest_message_time: chat.message_time,
        latest_message_sender: chat.sender_id,
        requested_product_name: chat.requested_product?.name,
        requested_product_images: chat.requested_product?.images,
        offered_product_name: chat.offered_product?.name,
        offered_product_images: chat.offered_product?.images
      }));
      
      setBarterChats(transformedData);
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  const handleBarterAction = async (requestId, action) => {
    try {
      setLoading(true);

      let update;
      if (action === 'accept') {
        update = { status: 'accepted' };
      } else if (action === 'reject') {
        update = { status: 'rejected' };
      } else if (action === 'delete') {
        const { error } = await supabase
          .from('barter_requests')
          .delete()
          .eq('id', requestId);
        if (error) throw error;

        setBarterChats(prev => prev.filter(request => request.id !== requestId));
        Alert.alert('Success', 'Barter request deleted');
        return;
      }

      const { error } = await supabase
        .from('barter_requests')
        .update(update)
        .eq('id', requestId);

      if (error) throw error;

      setBarterChats(prev =>
        prev.map(request =>
          request.id === requestId ? { ...request, ...update } : request
        )
      );

      Alert.alert('Success', `Barter request ${action}ed`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBarterStatus = (status) => {
    const currentStatus = status || 'pending';
    const statusColors = {
      pending: '#ffc107',
      accepted: '#28a745',
      rejected: '#dc3545',
      completed: '#6c757d'
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusColors[currentStatus] || '#6c757d' }]}> 
        <Text style={styles.statusText}>{currentStatus.toUpperCase()}</Text>
      </View>
    );
  };

  const renderBarterRequest = ({ item }) => {
    const isRequester = currentUser && currentUser.id === item.requester_id;
  
    const handleChatNavigation = () => {
      console.log('Navigating to chat with item:', item);
      if (!item.id) {
        console.error('No barterId provided');
        Alert.alert('Error', 'Unable to open chat. Barter ID is missing.');
        return;
      }
  
      router.push({
        pathname: 'screens/chat/chat',
        params: {
          barterId: item.id, // This is now barter_request_id
          otherUser: isRequester ? item.owner_name : item.requester_name,
          productId: item.requested_product_id,
        }
      });
    };
  
    return (
      
      <TouchableOpacity
        style={styles.barterCard}
        onPress={handleChatNavigation}
        disabled={!item.id}
      >
        <View style={styles.barterHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productText}>
              {item.requested_product_name || 'Unknown Product'} ↔ {item.offered_product_name || 'Unknown Product'}
            </Text>
            <Text style={styles.userText}>
              with {isRequester ? item.owner_name || 'Unknown User' : item.requester_name }
            </Text>
          </View>
          {item.status && renderBarterStatus(item.status)}
        </View>
  
        {item.latest_message && item.latest_message.trim() !== '' && (
          <View style={styles.messagePreview}>
            <Text style={styles.previewText} numberOfLines={1}>
              {item.latest_message_sender === currentUser.id ? 'You: ' : ''}
              {item.latest_message}
            </Text>
            <Text style={styles.timeText}>
              {item.latest_message_time ? new Date(item.latest_message_time).toLocaleDateString() : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
    <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        </TouchableOpacity>
        
      </View>
      <FlatList
        data={barterChats}
        keyExtractor={item => (item.id ? item.id.toString() : Math.random().toString())}
        renderItem={renderBarterRequest}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchBarterChats();
              setRefreshing(false);
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
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
 
  barterCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 12,
    elevation: 2
  },
  barterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  productInfo: {
    flex: 1
  },
  productText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  userText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    color: '#666'
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8
  }
});
