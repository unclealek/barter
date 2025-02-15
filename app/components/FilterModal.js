// components/FilterModal.js
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

export default function FilterModal({ visible, onClose, onApply, categories }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');

  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      priceRange,
      sortBy
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Products</Text>
          
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category.id) && styles.selectedChip
                ]}
                onPress={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category.id)
                      ? prev.filter(id => id !== category.id)
                      : [...prev, category.id]
                  );
                }}
              >
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Price Range</Text>
          <MultiSlider
            values={priceRange}
            onValuesChange={setPriceRange}
            min={0}
            max={1000}
            step={10}
            sliderLength={280}
            selectedStyle={{ backgroundColor: '#007AFF' }}
          />
          <View style={styles.priceLabels}>
            <Text>${priceRange[0]}</Text>
            <Text>${priceRange[1]}</Text>
          </View>

          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.sortOptions}>
            {[
              { label: 'Newest First', value: 'newest' },
              { label: 'Price: Low to High', value: 'price_asc' },
              { label: 'Price: High to Low', value: 'price_desc' }
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.selectedSort
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text style={styles.sortText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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