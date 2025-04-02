import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const barterId = params.barterId;
  const otherUser = params.otherUser;
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [barterDetails, setBarterDetails] = useState(null);



  useEffect(() => {
    if (!barterId) {
      console.error('No barterId provided');
      Alert.alert('Error', 'Unable to load chat');
      router.back();
      return;
    }

    async function initializeChat() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setCurrentUser(user);

        // Load messages
        await fetchMessages();
        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        Alert.alert('Error', 'Unable to load chat');
      }
    }

    initializeChat();
  }, [barterId]);


  
  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchBarterDetails();
    
    // Subscribe to new messages for this specific barter
    const subscription = supabase
      .channel(`barter_messages:${barterId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `barter_request_id=eq.${barterId}`
        },
        (payload) => {
          setMessages(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [barterId]);

  const fetchBarterDetails = async () => {
    const { data, error } = await supabase
      .from('barter_requests')
      .select(`
        id,
        status,
        requested_product:requested_product_id (name, images),
        offered_product:offered_product_id (name, images)
      `)
      .eq('id', barterId)
      .single();

    if (error) console.error(error);
    else setBarterDetails(data);
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('barter_request_id', barterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!barterId || !newMessage.trim() || !currentUser) return;

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          barter_request_id: barterId,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (insertError) throw insertError;
      setNewMessage('');
      await fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gantt Chart</Text>
      </View>
      <View style={styles.header}>
      {barterDetails && (
        <View style={styles.barterHeader}>
          <View style={styles.barterInfo}>
            <Text style={styles.barterTitle}>
              {barterDetails.requested_product.name} ↔ {barterDetails.offered_product.name}
            </Text>
            <Text style={styles.chatWith}>Chat with {otherUser}</Text>
          </View>
          <View style={[styles.statusBadge, styles[barterDetails.status]]}>
          <Text style={styles.statusText}>{barterDetails.status.toUpperCase()}</Text>
          </View>
        </View>
      )}
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.sender_id === currentUser.id ? styles.sentMessage : styles.receivedMessage
          ]}>
            <Text style={[
              styles.messageText,
              item.sender_id === currentUser.id ? styles.sentMessageText : styles.receivedMessageText
            ]}>
              {item.content}
            </Text>
            <Text style={styles.messageTime}>
              {new Date(item.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          style={styles.sendButton}
          disabled={barterDetails.status === 'completed' || barterDetails.status === 'rejected'}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButtonContainer: {
    flexDirection: 'row',
    top: 20,
    left: 20,
    zIndex: 1
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f8f9fa'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center'
  },
  barterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f8f9fa'
  },
  barterInfo: {
    flex: 1
  },
  barterTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  chatWith: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10
  },
  pending: { backgroundColor: '#ffc107' },
  accepted: { backgroundColor: '#28a745' },
  rejected: { backgroundColor: '#dc3545' },
  completed: { backgroundColor: '#6c757d' },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  messageContainer: {
    maxWidth: '80%',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 12,
    borderRadius: 16
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF'
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  sentMessageText: {
    color: '#fff'
  },
  receivedMessageText: {
    color: '#000'
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9f9f9'
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButton: {
    backgroundColor: '#B0C4DE'
  }
});
