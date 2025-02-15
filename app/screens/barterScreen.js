// app/screens/barterScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BarterScreen({ navigation }) {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const renderBarterRequest = ({ item }) => { 
    const isRequester = item.isRequester;
  
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>
            {isRequester ? 'Your request to ' : 'Request from '}
            {isRequester ? item.owner.username : item.requester.username}
          </Text>
          <Text style={styles.requestStatus}>{item.status}</Text>
        </View>
  
        <View style={styles.productInfo}>
          <View style={styles.productColumn}>
            <Text style={styles.productLabel}>Requested Product:</Text>
            <Text style={styles.productName}>{item.requested_product.name}</Text>
          </View>
          <View style={styles.productColumn}>
            <Text style={styles.productLabel}>Offered Product:</Text>
            <Text style={styles.productName}>{item.offered_product.name}</Text>
          </View>
        </View>
  
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            {!isRequester && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleBarterAction(item.id, 'accept')}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleBarterAction(item.id, 'reject')}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            {isRequester && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleBarterAction(item.id, 'delete')}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
  
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() =>
            router.push({
              pathname: 'screens/chat/chat',
              params: {
                barterId: item.id, 
                otherUser: isRequester ? item.owner.username : item.requester.username, 
                productId: item.requested_product_id, 
              }
            })
          }
        >
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  useEffect(() => {
    loadBarterRequests();
  }, []);

 async function loadBarterRequests() {
        try {
          setLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            Alert.alert('Session expired', 'Please log in again.');
            router.push('loginScreen');  // Redirect to login screen
            return;
          }
      
          const { data, error } = await supabase
            .from('barter_requests')
            .select(`
              *,
              requested_product:requested_product_id (name, images),
              offered_product:offered_product_id (name, images),
              requester:requester_id (username),
              owner:owner_id (username)
            `)
            .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
      
          if (error) throw error;
      
          const updatedRequests = data.map(request => ({
            ...request,
            isRequester: request.requester_id === user.id,
          }));
      
          setRequests(updatedRequests);
        } catch (error) {
          console.error('Error loading barter requests:', error.message);
          Alert.alert('Error', error.message);
        } finally {
          setLoading(false);
        }
      }
      
  

      async function handleBarterAction(requestId, action) {
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
      
            setRequests(prev => prev.filter(request => request.id !== requestId));
            Alert.alert('Success', 'Barter request deleted');
            return;
          }
      
          const { error } = await supabase
            .from('barter_requests')
            .update(update)
            .eq('id', requestId);
      
          if (error) throw error;
      
          setRequests(prev =>
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
      }
      

  

  return (
    <View style={styles.container}>
     <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        </TouchableOpacity>
        
      </View>
      <FlatList
        data={requests}
        renderItem={renderBarterRequest}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadBarterRequests();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No barter requests yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  
  requestCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestStatus: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productColumn: {
    flex: 1,
  },
  productLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  deleteButton: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  messageButton: {
    backgroundColor: '#5A4C77',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  messageButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});