// components/SearchBar.js
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText, onSubmit, onFilter }) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Search products..."
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity onPress={onFilter}>
        <Ionicons name="filter" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#fff',
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      padding: 8,
      marginRight: 10,
    },
    input: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginTop: 15,
      marginBottom: 10,
    },
    categoryChip: {
      padding: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
      marginRight: 8,
    },
    selectedChip: {
      backgroundColor: '#007AFF',
    },
    categoryText: {
      color: '#333',
    },
    priceLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
    },
    sortOptions: {
      marginTop: 10,
    },
    sortOption: {
      padding: 10,
      borderRadius: 8,
      marginBottom: 5,
    },
    selectedSort: {
      backgroundColor: '#f0f0f0',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    cancelButton: {
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#007AFF',
      flex: 1,
      marginRight: 10,
    },
    applyButton: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: '#007AFF',
      flex: 1,
      marginLeft: 10,
    },
    cancelButtonText: {
      color: '#007AFF',
      textAlign: 'center',
      fontSize: 16,
    },
    applyButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
    },
  });